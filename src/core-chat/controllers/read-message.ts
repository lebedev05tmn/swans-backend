import { Server } from 'socket.io';
import { messagesRepository } from '../../shared/config';
import { redis } from '../../shared/model';
import axios from 'axios';

export const socketReadMessage = async (
    io: Server,
    chatId: number,
    messageId: number,
    recipientAccessToken: string,
) => {
    try {
        const redisChat = await redis.get(`chat:${chatId}`);
        let chat = redisChat ? JSON.parse(redisChat) : [];

        if (!Array.isArray(chat)) {
            throw new Error(`Data in Redis for chat:${chatId} is not an array`);
        }

        const updatedChat = chat.map(
            (message: { message_id: number; is_readen: boolean }) => {
                if (message.message_id <= messageId) {
                    return { ...message, is_readen: true };
                }
                return message;
            },
        );

        let hasUpdates = updatedChat.some((msg, index) => msg !== chat[index]);

        if (hasUpdates) {
            await redis.set(`chat:${chatId}`, JSON.stringify(updatedChat));
            chat = updatedChat;
        }

        const updateResult = await messagesRepository
            .createQueryBuilder()
            .update()
            .set({ is_readen: true })
            .where('chat_id = :chatId AND message_id <= :messageId', {
                chatId,
                messageId,
            })
            .execute();

        if (updateResult.affected === 0 && !hasUpdates) {
            throw new Error(
                `Messages in chat ${chatId} up to ${messageId} not found`,
            );
        }

        emitReadEvent(io, chatId, messageId, recipientAccessToken);
    } catch (err) {
        console.error('Ошибка в socketReadMessage:', err);
        io.emit('error', {
            message: 'Ошибка при отметке сообщения как прочитанного',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

const emitReadEvent = async (
    io: Server,
    chatId: number,
    messageId: number,
    recipientAccessToken: string,
) => {
    try {
        const response = await axios.get(
            'http://localhost:8081/api/metadata/get',
            {
                headers: {
                    Authorization: `Bearer ${recipientAccessToken}`,
                },
            },
        );

        const recipientSocketId = response.data.socket_id;

        if (!recipientSocketId) {
            throw new Error("Recipient's socket id not found");
        }

        io.to(recipientSocketId).emit('message-is-readen', {
            chatId,
            messageId,
        });
    } catch (err) {
        console.log('Ошибка в emitReadEvent:', err);
        io.emit('error', {
            message: 'Ошибка при отправке события прочтения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
