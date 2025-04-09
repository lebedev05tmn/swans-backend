import { redis } from '../../shared/model';
import { messagesRepository } from '../../shared/config';
import { Server } from 'socket.io';
import axios from 'axios';

export const socketEditMessage = async (
    io: Server,
    recipientAccessToken: string,
    chatId: number,
    messageId: number,
    messageText: string,
) => {
    try {
        const redisChat = await redis.get(`chat:${chatId}`);
        const chat = redisChat ? JSON.parse(redisChat) : [];

        if (!Array.isArray(chat)) {
            throw new Error(`Data in Redis for chat:${chatId} is not an array`);
        }

        let message = chat.find(
            (message: { message_id: number }) =>
                message.message_id === messageId,
        );

        if (message) {
            message.message_text = messageText;
            await redis.set(`chat:${chatId}`, JSON.stringify(chat));
            emitEditEvent(
                io,
                recipientAccessToken,
                chatId,
                messageId,
                messageText,
            );
        } else {
            message = await messagesRepository.findOneBy({
                chat_id: chatId,
                message_id: messageId,
            });

            if (message) {
                message.message_text = messageText;
                await messagesRepository.save(message);
                emitEditEvent(
                    io,
                    recipientAccessToken,
                    chatId,
                    messageId,
                    messageText,
                );
            } else {
                throw new Error(
                    `Message with ID ${messageId} not found in Redis or Postgres`,
                );
            }
        }
    } catch (err) {
        console.error('Ошибка в socketEditMessage:', err);
        io.emit('error', {
            message: 'Ошибка при редактировании сообщения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

const emitEditEvent = async (
    io: Server,
    recipientAccessToken: string,
    chatId: number,
    messageId: number,
    messageText: string,
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
            messageText,
        });
    } catch (err) {
        console.log('Ошибка в emitEditEvent:', err);
        io.emit('error', {
            message: 'Ошибка при отправке события редактирования',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
