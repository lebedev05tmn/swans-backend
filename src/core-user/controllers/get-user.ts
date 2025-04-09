import { Request, Response } from 'express';
import getUserId from '../../core-auth/utils/getUserId';
import { userRepository } from '../routes/userRouter';

export default async (req: Request, res: Response) => {
    const user_id = getUserId(req, res);

    if (typeof user_id !== 'string') return;

    const userData = await userRepository.findOneByOrFail({ user_id });
    res.json(userData);
};
