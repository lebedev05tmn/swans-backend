import express, { Request, Response } from 'express';

import getUserAuthData from '../controllers/getUserAuthData';
import refreshAccessToken from '../controllers/refreshAccessToken';


export const userRouter = express.Router();

userRouter.get("/userAuthData", async (req: Request, res: Response) => {
    getUserAuthData(req, res);
});

userRouter.post("/refreshToken", async (req: Request, res: Response) => {
    refreshAccessToken(req, res);
})
