import { Request, Response } from 'express';
import { messagesRepository } from '../../shared/config';

const limit = 20;

export const chatPaginate = async (req: Request, res: Response) => {
    try {
        const chatId = Number(req.params.id);
        const page = Number(req.query.page);

        const offset = Math.max(0, (page - 1) * limit);

        const [messages, total] = await messagesRepository.findAndCount({
            where: { chat_id: chatId },
            order: { sending_time: 'DESC' },
            skip: offset,
            take: limit,
        });

        const paginated = {
            messages: messages,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
            },
        };

        res.status(200).json(paginated);
    } catch (err) {
        console.log('Ошибка пагинации:', err);
        res.status(500).send(`Ошибка при пагинации сообщений: ${err}`);
    }
};
