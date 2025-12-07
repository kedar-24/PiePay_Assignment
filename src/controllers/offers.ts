import { Request, Response } from 'express';
import { ingestFlipkartOffer, findBestDiscount } from '../services/offerService';
import { FlipkartResponse } from '../types';

export const ingestOffers = async (req: Request, res: Response) => {
    try {
        const root: FlipkartResponse = req.body;
        let newOffersCreated = 0;
        let offersIdentified = 0;

        // Traverse items to find OFFER_LIST
        if (!root || !root.items) {
            res.status(400).json({ error: 'Invalid JSON structure: missing root items' });
            return;
        }

        const offerListItems = root.items.filter(item => item.type === 'OFFER_LIST');

        for (const listItem of offerListItems) {
            const offers = listItem.data.offers?.offerList || [];
            offersIdentified += offers.length;

            for (const offer of offers) {
                const created = await ingestFlipkartOffer(offer);
                if (created) {
                    newOffersCreated++;
                }
            }
        }

        res.json({ offersIdentified, newOffersCreated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getHighestDiscount = async (req: Request, res: Response) => {
    try {
        const { amountToPay, bankName, paymentInstrument } = req.query;

        if (!amountToPay || !bankName || !paymentInstrument) {
            res.status(400).json({ error: 'Missing required query parameters' });
            return;
        }

        const amount = parseFloat(amountToPay as string);
        const bank = bankName as string;
        const instrument = paymentInstrument as string;

        const highestDiscountAmount = await findBestDiscount(amount, bank, instrument);

        res.json({ highestDiscountAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
