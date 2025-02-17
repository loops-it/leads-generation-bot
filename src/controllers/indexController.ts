// controllers/indexController.ts
import { Request, Response } from 'express';

export const getIndexPage = (req: Request, res: Response) => {
    res.render('index');
};
