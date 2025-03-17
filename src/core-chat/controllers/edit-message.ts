import { redis } from '../../shared/model';
import { messagesRepository, profileRepository } from '../../shared/config';
import { Server } from 'socket.io';

export const socketEditMessage = async (
    io: Server,
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
            emitEditEvent(io, message, chatId, messageId, messageText);
        } else {
            message = await messagesRepository.findOneBy({
                chat_id: chatId,
                message_id: messageId,
            });

            if (message) {
                message.message_text = messageText;
                await messagesRepository.save(message);
                emitEditEvent(io, message, chatId, messageId, messageText);
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
    message: any,
    chatId: number,
    messageId: number,
    messageText: string,
) => {
    try {
        const user_1 = await profileRepository.findOneBy({
            user_id: message.user1_id,
        });
        const user_2 = await profileRepository.findOneBy({
            user_id: message.user2_id,
        });

        if (!user_1 || !user_2) {
            throw new Error('One or both users not found');
        }

        const senderSocketId = user_1.socket_id as string;
        const recipientSocketId = user_2.socket_id as string;

        io.to([senderSocketId, recipientSocketId]).emit('message-is-edited', {
            chatId,
            messageId,
            messageText,
        });
    } catch (err) {
        console.error('Ошибка в emitEditEvent:', err);
        io.emit('error', {
            message: 'Ошибка при отправке события редактирования',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
