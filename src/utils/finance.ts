export const calculateBondPrice = (
    faceValue: number,
    couponRate: number, // Annual (0.05 for 5%)
    yearsToMaturity: number,
    ytm: number, // Annual (0.05 for 5%)
    frequency: number = 2 // 1 = Annual, 2 = Semiannual
): number => {
    const periods = yearsToMaturity * frequency;
    const couponPayment = (faceValue * couponRate) / frequency;
    const ratePerPeriod = ytm / frequency;

    let pvCoupons = 0;
    for (let t = 1; t <= periods; t++) {
        pvCoupons += couponPayment / Math.pow(1 + ratePerPeriod, t);
    }

    const pvFace = faceValue / Math.pow(1 + ratePerPeriod, periods);
    return pvCoupons + pvFace;
};

export const calculateYTM = (
    price: number,
    faceValue: number,
    couponRate: number,
    yearsToMaturity: number,
    frequency: number = 2
): number => {
    let low = 0;
    let high = 1; // 100% yield cap for search
    let mid = 0;
    let estimatedPrice = 0;

    // Simple binary search for YTM
    for (let i = 0; i < 100; i++) {
        mid = (low + high) / 2;
        estimatedPrice = calculateBondPrice(faceValue, couponRate, yearsToMaturity, mid, frequency);

        if (Math.abs(estimatedPrice - price) < 0.001) break;

        if (estimatedPrice > price) {
            low = mid; // Needs higher yield to lower price
        } else {
            high = mid;
        }
    }
    return mid;
};

export const calculateMacaulayDuration = (
    faceValue: number,
    couponRate: number,
    yearsToMaturity: number,
    ytm: number,
    frequency: number = 2
): number => {
    const periods = yearsToMaturity * frequency;
    const couponPayment = (faceValue * couponRate) / frequency;
    const ratePerPeriod = ytm / frequency;
    const price = calculateBondPrice(faceValue, couponRate, yearsToMaturity, ytm, frequency);

    let weightedSum = 0;
    for (let t = 1; t <= periods; t++) {
        const pvFlow = couponPayment / Math.pow(1 + ratePerPeriod, t);
        weightedSum += t * pvFlow;
    }
    const pvFace = faceValue / Math.pow(1 + ratePerPeriod, periods);
    weightedSum += periods * pvFace;

    const durationInPeriods = weightedSum / price;
    return durationInPeriods / frequency; // Convert back to years
};

export const calculateModifiedDuration = (
    macaulayDuration: number,
    ytm: number,
    frequency: number = 2
): number => {
    return macaulayDuration / (1 + ytm / frequency);
};

export const calculateConvexity = (
    faceValue: number,
    couponRate: number,
    yearsToMaturity: number,
    ytm: number,
    frequency: number = 2
): number => {
    const periods = yearsToMaturity * frequency;
    const couponPayment = (faceValue * couponRate) / frequency;
    const ratePerPeriod = ytm / frequency;
    const price = calculateBondPrice(faceValue, couponRate, yearsToMaturity, ytm, frequency);

    let weightedSum = 0;
    for (let t = 1; t <= periods; t++) {
        const pvFlow = couponPayment / Math.pow(1 + ratePerPeriod, t);
        weightedSum += t * (t + 1) * pvFlow;
    }
    const pvFace = faceValue / Math.pow(1 + ratePerPeriod, periods);
    weightedSum += periods * (periods + 1) * pvFace;

    const convexityInPeriods = weightedSum / (price * Math.pow(1 + ratePerPeriod, 2));
    return convexityInPeriods / Math.pow(frequency, 2); // Annualize
};
