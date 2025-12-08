export interface Bond {
    id: string;
    issuer: string;
    rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
    coupon: number;
    maturityDate: string;
    price: number;
    faceValue: number;
    sector: 'Government' | 'Corporate' | 'Municipal';
    yield: number;
    duration: number;
}

const issuers = ['US Treasury', 'Apple Inc.', 'Microsoft', 'Tesla', 'JPMorgan', 'Coca-Cola', 'Pfizer', 'Exxon', 'Goldman Sachs', 'Verizon'];
const ratings = ['AAA', 'AA', 'A', 'BBB', 'BB'];
const sectors = ['Government', 'Corporate', 'Municipal'];

export const generateMarketData = (count: number = 50): Bond[] => {
    return Array.from({ length: count }).map((_, i) => {
        const faceValue = 1000;
        const price = 850 + Math.random() * 300; // 850-1150
        const coupon = 2 + Math.random() * 6; // 2-8%
        const years = 1 + Math.random() * 29; // 1-30 years

        // Rough approx yield
        const annualCoupon = faceValue * (coupon / 100);
        const approxYield = (annualCoupon + (faceValue - price) / years) / ((faceValue + price) / 2);

        return {
            id: `BOND-${1000 + i}`,
            issuer: issuers[Math.floor(Math.random() * issuers.length)],
            rating: ratings[Math.floor(Math.random() * ratings.length)] as any,
            coupon: Number(coupon.toFixed(2)),
            maturityDate: new Date(Date.now() + years * 31536000000).toISOString().split('T')[0],
            price: Number(price.toFixed(2)),
            faceValue,
            sector: sectors[Math.floor(Math.random() * sectors.length)] as any,
            yield: Number((approxYield * 100).toFixed(2)),
            duration: Number((years * 0.8).toFixed(2)) // Rough duration approx
        };
    });
};

export const MOCK_MARKET_DATA = generateMarketData();
