import { redis } from '../../shared/model';
import { messagesRepository } from '../../shared/config';
import { Server, Socket } from 'socket.io';
import axios from 'axios';

export const socketDeleteMessage = async (
    io: Server,
    socket: Socket,
    recipientAccessToken: string,
    chatId: number,
    messageId: number,
) => {
    try {
        const redisChat = await redis.get(`chat:${chatId}`);
        let chat = redisChat ? JSON.parse(redisChat) : [];

        if (!Array.isArray(chat)) {
            throw new Error(`Data in Redis for chat:${chatId} is not an array`);
        }

        const message = chat.find(
            (message: { message_id: number }) =>
                message.message_id === messageId,
        );

        if (message) {
            chat = chat.filter((msg: any) => msg.message_id !== messageId);

            if (chat.length === 0) {
                await redis.del(`chat:${chatId}`);
                await redis.del(`currentMessageId:${chatId}`);
            } else {
                await redis.set(`chat:${chatId}`, JSON.stringify(chat));
            }
        } else {
            const deleteResult = await messagesRepository.delete({
                message_id: messageId,
            });

            if (deleteResult.affected === 0) {
                throw new Error(`Message with ID ${messageId} not found`);
            }
        }

        const recipient = await axios.get(
            'http://localhost:8081/api/metadata/get',
            {
                headers: {
                    Authorization: `Bearer ${recipientAccessToken}`,
                },
            },
        );

        if (!recipient) {
            throw new Error(`Recipient not found`);
        }

        io.to(recipient.data.socket_id).emit('message-is-deleted', messageId);
    } catch (err) {
        console.error('Ошибка в socketDeleteMessage:', err);

        socket.emit('error', {
            message: 'Ошибка при удалении сообщения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
