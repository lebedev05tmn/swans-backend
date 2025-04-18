import { Request, Response } from 'express';
import { messagesRepository } from '../../../shared/config';
import { decodeUserId } from '../../../core-auth/utils/getUserId';
import { userRepository } from '../../../core-user/routes/userRouter';
import { setLocalTime } from '../../../core-chat/utils';

export const chatPaginate = async (req: Request, res: Response) => {
    try {
        const chatId = Number(req.params.id);
        const limit = Number(req.query.limit);
        const offset = Number(req.query.offset);

        const [messages, total] = await messagesRepository.findAndCount({
            where: { chat_id: chatId },
            order: { sending_time: 'DESC' },
            skip: offset,
            take: limit,
        });

        const userId = await decodeUserId(req.headers.authorization);
        const user = await userRepository.findOneByOrFail({
            user_id: userId,
        });

        const formattedMessages = messages.map((message) => {
            message.sending_time = setLocalTime(message.sending_time, user.timezone);
            return message;
        });

        const paginated = {
            success: true,
            messages: formattedMessages,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                currentOffset: offset,
                locale: user.locale,
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
