import express, { Request, Response } from 'express';

import server from '../../shared/utils/server';

export const anketRouter = express.Router();

anketRouter.get('/dating', async (req: Request, res: Response) => {
    const jsonRPCRequest = req.body;
    const response = await server.receive(jsonRPCRequest);
    if (response) {
        res.json(response);
    }
});
