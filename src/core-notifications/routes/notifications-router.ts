import express from 'express';
import { Request, Response } from 'express';
import { addExpoPushToken } from '../offline/add-token';

export const notificationsRouter = express.Router();

notificationsRouter.post('/add_token', async (req: Request, res: Response) => {
    await addExpoPushToken(req, res);
});
