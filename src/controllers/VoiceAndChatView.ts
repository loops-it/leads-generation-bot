// routes/index.ts
import express, { Request, Response } from 'express';
import QuickQuestion from '../../models/QuickQuestion';

const router = express.Router();

router.get('/voice-and-chat-bot', async (req: Request, res: Response) => {
    const questions  = await QuickQuestion.findAll({});
    res.render('intergratedBot',{questions: questions});
});

export default router;
