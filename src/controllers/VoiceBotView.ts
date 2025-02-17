// routes/index.ts
import express, { Request, Response } from 'express';
import QuickQuestion from '../../models/QuickQuestion';

const router = express.Router();

router.get('/voice-bot', async (req: Request, res: Response) => {
    const questions  = await QuickQuestion.findAll({});
    res.render('audioBot',{questions: questions});
});

export default router;
