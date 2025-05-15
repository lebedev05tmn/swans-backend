import express, { Request, Response } from 'express';

import server from '../../shared/utils/server';
import { get_anket_profile } from '../controllers/getAnketProfile.ts/getAnketProfile';
import { like_user } from '../controllers/likeUser/likeUser';
import { get_likes_list } from '../controllers/getLikesList/getLikesList';

export const anketRouter = express.Router();

anketRouter.get('/dating', async (req: Request, res: Response) => {
    const jsonRPCRequest = req.body;
    const response = await server.receive(jsonRPCRequest);
    if (response) {
        res.json(response);
    }
});

anketRouter.get('/get_likes_list', async (req: Request, res: Response) => {
    get_likes_list(req, res);
});

anketRouter.post('/get_anket_data', async (req: Request, res: Response) => {
    get_anket_profile(req, res);
});

anketRouter.post('/like_user', async (req: Request, res: Response) => {
    like_user(req, res);
});
