import express from 'express';

import getUserAuthData from '../controllers/getUserAuthData';


export const userRouter = express.Router();

userRouter.get("/userAuthData/:id", getUserAuthData);
