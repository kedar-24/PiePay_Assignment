import { PrismaClient } from '@prisma/client';
import { ProcessedOffer, FlipkartOfferItem } from '../types';

const prisma = new PrismaClient();

const parseOfferText = (text: string): Partial<ProcessedOffer> => {
    const result: Partial<ProcessedOffer> = {
        discountType: 'FLAT',
        discountValue: 0,
        maxDiscountAmount: 0,
        minTransactionAmount: 0,
    };

    // 1. Extract Discount (Percentage or Flat)
    const percentMatch = text.match(/(\d+)%\s+off|(\d+)%\s+cashback/i);
    // Added 'Extra ... off' to regex
    const flatMatch = text.match(/Flat\s+₹([\d,]+)|Get\s+₹([\d,]+)\s+cashback|Save\s+₹([\d,]+)|Extra\s+₹([\d,]+)\s+off/i);

    if (percentMatch) {
        result.discountType = 'PERCENTAGE';
        result.discountValue = parseFloat(percentMatch[1] || percentMatch[2]);
    } else if (flatMatch) {
        result.discountType = 'FLAT';
        const valStr = flatMatch[1] || flatMatch[2] || flatMatch[3] || flatMatch[4];
        result.discountValue = parseFloat(valStr.replace(/,/g, ''));
        result.maxDiscountAmount = result.discountValue; // For flat, max is same
    }

    // 2. Extract Max Discount (Up to)
    const uptoMatch = text.match(/up\s+to\s+₹([\d,]+)/i);
    if (uptoMatch) {
        result.maxDiscountAmount = parseFloat(uptoMatch[1].replace(/,/g, ''));
    }

    // 3. Extract Min Purchase
    const minMatch = text.match(/Min\s+Order\s+Value\s+₹([\d,]+)|orders\s+of\s+₹([\d,]+)\s+and\s+above/i);
    if (minMatch) {
        const valStr = minMatch[1] || minMatch[2];
        result.minTransactionAmount = parseFloat(valStr.replace(/,/g, ''));
    }

    return result;
};

const inferPaymentMethod = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('credit card')) return 'CREDIT_CARD';
    if (lower.includes('debit card')) return 'DEBIT_CARD';
    if (lower.includes('emi')) return 'EMI';
    if (lower.includes('upi')) return 'UPI';
    if (lower.includes('wallet')) return 'WALLET';
    return 'OTHER';
};

export const ingestFlipkartOffer = async (item: FlipkartOfferItem) => {
    const text = item.offerDescription.text;
    const details = parseOfferText(text);

    // Merge extracted details with item info
    const offerData: ProcessedOffer = {
        offerId: item.offerDescription.id,
        description: text,
        bank: item.provider[0] || 'Unknown', // Take first provider
        paymentInstrument: inferPaymentMethod(text),
        minTransactionAmount: details.minTransactionAmount || 0,
        discountType: details.discountType || 'FLAT',
        discountValue: details.discountValue || 0,
        maxDiscountAmount: details.maxDiscountAmount || 0, // Fallback
    };

    return await prisma.offer.upsert({
        where: { offerId: offerData.offerId },
        update: {
            description: offerData.description,
            terms: {
                update: {
                    minPurchaseAmount: offerData.minTransactionAmount,
                    discountPercentage: offerData.discountType === 'PERCENTAGE' ? offerData.discountValue : 0,
                    maxDiscountAmount: offerData.maxDiscountAmount,
                },
            },
            banks: {
                deleteMany: {},
                create: [{ name: offerData.bank }],
            },
            paymentMethods: {
                deleteMany: {},
                create: [{ name: offerData.paymentInstrument }],
            },
        },
        create: {
            offerId: offerData.offerId,
            description: offerData.description,
            // validUntil: Not available in text usually, leaving null or could infer
            terms: {
                create: {
                    minPurchaseAmount: offerData.minTransactionAmount,
                    discountPercentage: offerData.discountType === 'PERCENTAGE' ? offerData.discountValue : 0,
                    maxDiscountAmount: offerData.maxDiscountAmount,
                },
            },
            banks: {
                create: [{ name: offerData.bank }],
            },
            paymentMethods: {
                create: [{ name: offerData.paymentInstrument }],
            },
        },
    });
};

export const findBestDiscount = async (
    amountToPay: number,
    bankName: string,
    paymentInstrument: string
) => {
    // 1. Find offers matching Bank and Payment Instrument
    const offers = await prisma.offer.findMany({
        where: {
            banks: {
                some: {
                    name: bankName,
                },
            },
            paymentMethods: {
                some: {
                    name: paymentInstrument,
                },
            },
        },
        include: {
            terms: true,
        },
    });

    let maxDiscount = 0;

    for (const offer of offers) {
        if (!offer.terms) continue;

        // 2. Check Min Purchase Amount
        if (amountToPay < offer.terms.minPurchaseAmount) continue;

        // 3. Calculate Discount
        let actualDiscount = 0;
        if (offer.terms.discountPercentage > 0) {
            const percentageDiscount = (amountToPay * offer.terms.discountPercentage) / 100;
            actualDiscount = Math.min(percentageDiscount, offer.terms.maxDiscountAmount);
        } else {
            // Flat discount (using maxDiscountAmount as the flat value)
            actualDiscount = offer.terms.maxDiscountAmount;
        }

        if (actualDiscount > maxDiscount) {
            maxDiscount = actualDiscount;
        }
    }

    return maxDiscount;
};
