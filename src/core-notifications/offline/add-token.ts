import { Request, Response } from 'express';
import { userRepository } from '../../core-user/routes/userRouter';
import { decodeUserId } from '../../core-auth/utils/getUserId';

export const addExpoPushToken = async (req: Request, res: Response) => {
    try {
        const userId = await decodeUserId(req.headers.authorization);
        const token = req.body.expoPushToken;

        const user = await userRepository.findOneByOrFail({
            user_id: userId,
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.expo_push_tokens?.includes(token)) {
            user.expo_push_tokens?.push(token);
        }

        await userRepository.save(user);

        return res.sendStatus(201);
    } catch (error) {
        return res.status(400).send(`Invalid input data: ${error}`);
    }
};
