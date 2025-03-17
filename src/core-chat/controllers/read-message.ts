import { Server } from 'socket.io';
import { messagesRepository, profileRepository } from '../../shared/config';
import { redis } from '../../shared/model';

export const socketReadMessage = async (
    io: any,
    chatId: number,
    messageId: number,
) => {
    try {
        const redisChat = await redis.get(`chat:${chatId}`);
        let chat = redisChat ? JSON.parse(redisChat) : [];

        if (!Array.isArray(chat)) {
            throw new Error(`Data in Redis for chat:${chatId} is not an array`);
        }

        let message = chat.find(
            (message: { message_id: number }) =>
                message.message_id === messageId,
        );

        if (message) {
            message.is_readen = true;
            message.reading_time = new Date();
            await redis.set(`chat:${chatId}`, JSON.stringify(chat));
            emitReadEvent(io, message, chatId, messageId);
        } else {
            message = await messagesRepository.findOneBy({
                chat_id: chatId,
                message_id: messageId,
            });

            if (message) {
                message.is_readen = true;
                message.reading_time = new Date();
                await messagesRepository.save(message);
                emitReadEvent(io, message, chatId, messageId);
            } else {
                throw new Error(
                    `Message with ID ${messageId} not found in Redis or Postgres`,
                );
            }
        }
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
    message: any,
    chatId: number,
    messageId: number,
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

        io.to([senderSocketId, recipientSocketId]).emit('message-is-readen', {
            chatId,
            messageId,
        });
    } catch (err) {
        console.error('Ошибка в emitReadEvent:', err);
        io.emit('error', {
            message: 'Ошибка при отправке события прочтения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
