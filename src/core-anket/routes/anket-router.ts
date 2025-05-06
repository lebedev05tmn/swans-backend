import express, { Request, Response } from 'express';

import server from '../../shared/utils/server';
import { get_anket_profile } from '../controllers/getAnketProfile.ts/getAnketProfile';

export const anketRouter = express.Router();

anketRouter.get('/dating', async (req: Request, res: Response) => {
    const jsonRPCRequest = req.body;
    const response = await server.receive(jsonRPCRequest);
    if (response) {
        res.json(response);
    }
});

anketRouter.post('/get_anket_data', async (req: Request, res: Response) => {
    get_anket_profile(req, res);
});
