import { Server } from 'socket.io';
import { messagesRepository, profileRepository } from '../../shared/config';
import { redis } from '../../shared/model';
import axios from 'axios';
import { decodeUserId } from '../../core-auth/utils/getUserId';
import { userRepository } from '../../core-user/routes/userRouter';
import { createQueryBuilder } from 'typeorm';

export const socketSendMessage = async (
    io: Server,
    fromAccessToken: string,
    toAccessToken: string,
    messageText: string,
    chatId: number,
    responseTo: number | null,
    images: string[] | null,
) => {
    try {
        if (!fromAccessToken || !toAccessToken) {
            throw new Error('myDatabaseId or myUsername is undefined');
        }

        const redisKeyCurrentId = `currentMessageId:${chatId}`;
        const keyChat = `chat:${chatId}`;

        let newMessageId = await redis
            .get(redisKeyCurrentId)
            .then((data) => Number(data));

        if (!newMessageId) {
            const lastMessage = await messagesRepository.findOne({
                where: { chat_id: chatId },
                order: { message_id: 'DESC' },
            });

            newMessageId = lastMessage ? lastMessage.message_id + 1 : 1;
            await redis.set(redisKeyCurrentId, newMessageId);
        } else {
            await redis.incr(redisKeyCurrentId);
            newMessageId++;
        }

        const senderId = decodeUserId(fromAccessToken);
        const recipientId = decodeUserId(toAccessToken);

        const message = {
            message_id: newMessageId,
            chat_id: chatId,
            sender_id: senderId,
            recipient_id: recipientId,
            message_text: messageText,
            sending_time: new Date(),
            is_readen: false,
            images: images ? images : null,
            response_to: responseTo ? responseTo : null,
            reaction_sender: null,
            reaction_recipient: null,
        };

        const chatExists = await redis.exists(keyChat);
        let messagesArray: any[] = [];

        if (chatExists) {
            const rawData = await redis.get(keyChat);
            messagesArray = rawData ? JSON.parse(rawData) : [];
        }

        messagesArray.push(message);
        await redis.set(keyChat, JSON.stringify(messagesArray));

        const recipientUser = await userRepository
            .createQueryBuilder('user')
            .select('user.socket_id')
            .where('user.user_id = :id', { id: recipientId })
            .getRawOne();

        if (!recipientUser) throw new Error('User not found');

        const recipientSocket = recipientUser.socket_id;

        if (!recipientSocket) {
            throw new Error(`Recipient with ID ${recipientId} not found`);
        }

        io.to(recipientSocket).emit('add-message', {
            sender: senderId,
            chatId: chatId,
            messageId: newMessageId,
            messageText: messageText,
            responseTo: responseTo,
            images: images,
        });
    } catch (err) {
        console.error('Ошибка в socketSendMessage:', err);
        io.emit('error', {
            message: 'Ошибка при отправке сообщения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
