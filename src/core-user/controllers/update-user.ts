import { Request, Response } from 'express';
import { User } from '../models/entities/User';
import getUserId from '../../core-auth/utils/getUserId';
import { HTTP_STATUSES } from '../../shared/utils';
import { userRepository } from '../routes/userRouter';

export default async (req: Request<Record<string, string>, Record<string, unknown>, Partial<User>>, res: Response) => {
    const user_id = getUserId(req, res);

    if (typeof user_id !== 'string') return;

    const badRequest = Object.keys(req.body).some((value) => Object.keys(User).includes(value));

    if (badRequest) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Invalid request body',
        });
        return;
    }

    try {
        const update = await userRepository
            .createQueryBuilder()
            .update(User)
            .set(req.body)
            .where({ user_id })
            .returning('*')
            .execute();

        res.json(update.raw);
    } catch {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Invalid request body',
        });
    }
};
