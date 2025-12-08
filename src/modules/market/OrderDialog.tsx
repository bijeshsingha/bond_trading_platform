import React, { useState, useEffect } from 'react';
import type { Bond } from './data';
import { useTrading } from '../../context/TradingContext';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Components';

interface OrderDialogProps {
    bond: Bond | null;
    open: boolean;
    onClose: () => void;
}

export const OrderDialog: React.FC<OrderDialogProps> = ({ bond, open, onClose }) => {
    const { executeTrade, cash, holdings } = useTrading();
    const [quantity, setQuantity] = useState<number>(0);
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
    const [step, setStep] = useState<'ENTRY' | 'CONFIRM'>('ENTRY');

    // Calculations
    const price = bond?.price || 0;
    const principal = price * quantity;
    // Simplified Accrued Interest: Random 0-180 days interest
    // Real calculation would need day count convention and last coupon date
    const accruedInterest = bond ? (bond.faceValue * (bond.coupon / 100) * (quantity)) * (45 / 360) : 0;
    const totalSettlement = principal + accruedInterest;

    // Reset on open
    useEffect(() => {
        if (open) {
            setQuantity(10);
            setStep('ENTRY');
            setSide('BUY');
        }
    }, [open, bond]);

    if (!open || !bond) return null;

    const handleSubmit = () => {
        if (step === 'ENTRY') {
            setStep('CONFIRM');
        } else {
            const success = executeTrade(bond, quantity, side);
            if (success) {
                onClose();
            }
        }
    };

    const maxSellQty = holdings.find(h => h.id === bond.id)?.quantity || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg bg-slate-950 border border-slate-800 shadow-xl animate-in zoom-in-95 duration-200">
                <CardHeader className="border-b border-slate-800 pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                            {side === 'BUY' ? 'Buy' : 'Sell'} {bond.issuer}
                            <span className="ml-2 text-sm font-normal text-slate-400">{bond.id}</span>
                        </CardTitle>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {step === 'ENTRY' ? (
                        <>
                            <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
                                <button
                                    className={`flex-1 py-2 rounded-md font-medium transition-colors ${side === 'BUY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    onClick={() => setSide('BUY')}
                                >
                                    Buy
                                </button>
                                <button
                                    className={`flex-1 py-2 rounded-md font-medium transition-colors ${side === 'SELL' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    onClick={() => setSide('SELL')}
                                >
                                    Sell
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Order Type</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200"
                                        value={orderType}
                                        onChange={(e) => setOrderType(e.target.value as any)}
                                    >
                                        <option value="MARKET">Market</option>
                                        <option value="LIMIT">Limit</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Quantity (Units)</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                    {side === 'SELL' && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Max Sell: {maxSellQty}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Price</span>
                                    <span className="text-slate-200">${price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Principal</span>
                                    <span className="text-slate-200">${principal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Accrued Interest (45 days)</span>
                                    <span className="text-slate-200">${accruedInterest.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-base">
                                    <span className="text-slate-100">Total Settlement</span>
                                    <span className="text-blue-400">${totalSettlement.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {side === 'BUY' && cash < totalSettlement && (
                                <div className="text-red-400 text-sm bg-red-950/20 p-2 rounded border border-red-900/50">
                                    Insufficient Funds due to Total Settlement costs.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4 text-center py-4">
                            <div className="text-4xl">
                                {side === 'BUY' ? '🛒' : '💰'}
                            </div>
                            <h3 className="text-xl font-bold text-slate-100">Confirm Order</h3>
                            <p className="text-slate-400">
                                You are about to {side} <span className="text-slate-100 font-bold">{quantity}</span> units of <br />
                                <span className="text-blue-400">{bond.issuer}</span> at <span className="text-slate-100">${price}</span>
                            </p>

                            <div className="bg-slate-900 p-4 rounded text-left mx-auto max-w-xs space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Settlement</span>
                                    <span>${totalSettlement.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">New Cash Bal</span>
                                    <span>${(cash + (side === 'SELL' ? totalSettlement : -totalSettlement)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {step === 'CONFIRM' && (
                            <Button
                                className="flex-1 bg-slate-800 hover:bg-slate-700"
                                onClick={() => setStep('ENTRY')}
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            className={`flex-1 ${side === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                            onClick={handleSubmit}
                            disabled={side === 'BUY' && cash < totalSettlement}
                        >
                            {step === 'ENTRY' ? 'Review Order' : 'Submit Order'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
