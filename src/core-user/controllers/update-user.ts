import { Request, Response } from 'express';
import { User } from '../models/entities/User';
import getUserId from '../../core-auth/utils/getUserId';
import { emitChatMetadata, HTTP_STATUSES } from '../../shared/utils';
import { userRepository } from '../routes/userRouter';
import { chatsRepository } from '../../shared/config';

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

    const body = req.body;

    const chats = await chatsRepository
        .createQueryBuilder('chat')
        .select(['chat.chat_id'])
        .where('chat.user1_id = :userId OR chat.user2_id = :userId', { userId: user_id })
        .getMany();

    if (chats.length > 0) {
        await Promise.all(chats.map((chat) => emitChatMetadata(user_id, chat.chat_id)));
    }

    try {
        if (body.online === false) body.last_visit = new Date();

        const update = await userRepository
            .createQueryBuilder()
            .update(User)
            .set(body)
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
