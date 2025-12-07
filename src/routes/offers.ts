import { Router } from 'express';
import { ingestOffers, getHighestDiscount } from '../controllers/offers';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

router.post('/offer', ingestOffers);
router.get('/highest-discount', getHighestDiscount);

export default router;
