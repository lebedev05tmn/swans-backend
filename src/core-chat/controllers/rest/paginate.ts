import { Request, Response } from 'express';
import { decodeUserId } from '../../../core-auth/utils/getUserId';
import { userRepository } from '../../../core-user/routes/userRouter';
import { IMessage, setLocalTime } from '../../../core-chat/utils';
import { chatsRepository } from '../../../shared/config';

export const chatPaginate = async (req: Request, res: Response) => {
    try {
        const chatId = Number(req.params.id);
        const limit = Number(req.query.limit);
        const offset = Number(req.query.offset);

        const chat = await chatsRepository.findOneByOrFail({
            chat_id: chatId,
        });

        const allMessages = chat.messages || [];

        const sortedMessages = [...allMessages].sort(
            (a, b) => new Date(b.sending_time).getTime() - new Date(a.sending_time).getTime(),
        );

        const messages = sortedMessages.slice(offset, offset + limit);

        const userId = await decodeUserId(req.headers.authorization);
        const user = await userRepository.findOneByOrFail({
            user_id: userId,
        });

        const formattedMessages = messages.map((message: IMessage) => {
            message.sending_time = setLocalTime(message.sending_time, user.timezone);
            return message;
        });

        const paginated = {
            success: true,
            messages: formattedMessages,
            meta: {
                totalItems: allMessages.length,
                count: messages.length,
            },
        };

        res.status(200).json(paginated);
    } catch (err) {
        res.status(500).json({
            error: 'Ошибка при пагинации сообщений',
            details: err instanceof Error ? err.message : String(err),
        });
    }
};
