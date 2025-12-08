import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Bond } from '../modules/market/data';

export interface PortfolioPosition extends Bond {
    quantity: number;
    avgCost: number;
}

export interface Trade {
    id: string;
    bondId: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    timestamp: number;
    pnl?: number; // Realized P&L for sells
}

interface TradingContextType {
    cash: number;
    holdings: PortfolioPosition[];
    trades: Trade[];
    executeTrade: (bond: Bond, quantity: number, type: 'BUY' | 'SELL') => boolean;
    getHoldingsValuation: () => { totalValue: number; totalCost: number; unrealizedPnl: number };
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const useTrading = () => {
    const context = useContext(TradingContext);
    if (!context) {
        throw new Error('useTrading must be used within a TradingProvider');
    }
    return context;
};

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from localStorage or default
    const [cash, setCash] = useState(() => {
        const saved = localStorage.getItem('bond_trading_cash');
        return saved ? Number(saved) : 1000000;
    });
    const [holdings, setHoldings] = useState<PortfolioPosition[]>(() => {
        const saved = localStorage.getItem('bond_trading_holdings');
        return saved ? JSON.parse(saved) : [];
    });
    const [trades, setTrades] = useState<Trade[]>(() => {
        const saved = localStorage.getItem('bond_trading_trades');
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage whenever state changes
    React.useEffect(() => {
        localStorage.setItem('bond_trading_cash', cash.toString());
    }, [cash]);

    React.useEffect(() => {
        localStorage.setItem('bond_trading_holdings', JSON.stringify(holdings));
    }, [holdings]);

    React.useEffect(() => {
        localStorage.setItem('bond_trading_trades', JSON.stringify(trades));
    }, [trades]);

    const executeTrade = (bond: Bond, quantity: number, type: 'BUY' | 'SELL'): boolean => {
        // const totalConsideration = (bond.price / 100) * quantity * bond.faceValue; 

        // In data.ts, price is ~850-1150 for 1000 face value. So price is absolute dollar value per bond unit.

        const settlementAmount = bond.price * quantity; // Simplified: Price * Qty (since mock data price is ~$1000)

        if (type === 'BUY') {
            if (cash < settlementAmount) {
                alert("Insufficient Cash!");
                return false;
            }

            setCash(prev => prev - settlementAmount);

            setHoldings(prev => {
                const existing = prev.find(h => h.id === bond.id);
                if (existing) {
                    // Update WAC
                    const totalOldCost = existing.quantity * existing.avgCost;
                    const totalNewCost = quantity * bond.price;
                    const newQty = existing.quantity + quantity;
                    const newAvgCost = (totalOldCost + totalNewCost) / newQty;

                    return prev.map(h => h.id === bond.id ? { ...h, quantity: newQty, avgCost: newAvgCost } : h);
                } else {
                    return [...prev, { ...bond, quantity, avgCost: bond.price }];
                }
            });
        } else {
            // SELL
            const existing = holdings.find(h => h.id === bond.id);
            if (!existing || existing.quantity < quantity) {
                alert("Insufficient Holdings!");
                return false;
            }

            const realizedPnl = (bond.price - existing.avgCost) * quantity;
            setCash(prev => prev + settlementAmount);

            setHoldings(prev => {
                const newQty = existing.quantity - quantity;
                if (newQty === 0) {
                    return prev.filter(h => h.id !== bond.id);
                }
                return prev.map(h => h.id === bond.id ? { ...h, quantity: newQty } : h);
            });

            setTrades(prev => [...prev, {
                id: Date.now().toString(),
                bondId: bond.id,
                type: 'SELL',
                quantity,
                price: bond.price,
                timestamp: Date.now(),
                pnl: realizedPnl
            }]);
            return true;
        }

        // Record Buy Trade
        setTrades(prev => [...prev, {
            id: Date.now().toString(),
            bondId: bond.id,
            type: 'BUY',
            quantity,
            price: bond.price,
            timestamp: Date.now()
        }]);

        return true;
    };

    const getHoldingsValuation = () => {
        const totalValue = holdings.reduce((sum, h) => sum + (h.price * h.quantity), 0); // Note: In a real app, 'price' should come from live market data, not the holding snapshot.
        const totalCost = holdings.reduce((sum, h) => sum + (h.avgCost * h.quantity), 0);
        return { totalValue, totalCost, unrealizedPnl: totalValue - totalCost };
    };

    return (
        <TradingContext.Provider value={{ cash, holdings, trades, executeTrade, getHoldingsValuation }}>
            {children}
        </TradingContext.Provider>
    );
};
