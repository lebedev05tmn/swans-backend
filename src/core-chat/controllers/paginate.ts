import { Socket } from 'socket.io';
import { messagesRepository } from '../../shared/config';

const limit = 20;

export const socketPaginate = async (
    socket: Socket,
    chatId: number,
    page: number,
) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);

        const [messages, total] = await messagesRepository.findAndCount({
            where: { chat_id: chatId },
            order: { sending_time: 'DESC' },
            skip: offset,
            take: limit,
        });

        socket.emit('paginated', {
            messages: messages,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
            },
        });
    } catch (err) {
        console.error('Ошибка в socketPaginate:', err);
        socket.emit('error', {
            message: 'Ошибка при пагинации сообщений',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
