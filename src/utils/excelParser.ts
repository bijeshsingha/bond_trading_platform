import * as XLSX from 'xlsx';
import type { Bond } from '../modules/market/data';

interface ExcelBondRow {
    ISIN?: string;
    ID?: string;
    Issuer?: string;
    Rating?: string;
    Coupon?: number;
    Maturity?: string; // Excel might return this as a date number or string
    'Maturity Date'?: string;
    Price?: number;
    'Face Value'?: number;
    Sector?: string;
    Yield?: number;
    Duration?: number;
    [key: string]: any;
}

export const parseExcelFile = (file: File): Promise<Bond[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json<ExcelBondRow>(worksheet);

                const bonds: Bond[] = jsonData.map((row, index) => {
                    // Helper to parse date
                    let maturityDate = new Date().toISOString().split('T')[0];
                    if (row.Maturity || row['Maturity Date']) {
                        // Simple check if it's an Excel serial date
                        const dateVal = row.Maturity || row['Maturity Date'];
                        if (typeof dateVal === 'number') {
                            const date = new Date((dateVal - (25567 + 2)) * 86400 * 1000);
                            maturityDate = date.toISOString().split('T')[0];
                        } else {
                            maturityDate = String(dateVal);
                        }
                    }

                    // Map fields with fallbacks
                    return {
                        id: row.ID || row.ISIN || `IMP-${index}-${Date.now()}`,
                        issuer: row.Issuer || 'Unknown Issuer',
                        rating: (row.Rating as any) || 'BBB',
                        coupon: Number(row.Coupon) || 0,
                        maturityDate: maturityDate,
                        price: Number(row.Price) || 100.00,
                        faceValue: Number(row['Face Value']) || 1000,
                        sector: (row.Sector as any) || 'Corporate',
                        yield: Number(row.Yield) || 0,
                        duration: Number(row.Duration) || 0,
                    };
                });

                resolve(bonds);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
};
