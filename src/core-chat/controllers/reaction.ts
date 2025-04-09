import { Server } from 'socket.io';
import { redis } from '../../shared/model';
import { messagesRepository } from '../../shared/config';
import axios from 'axios';

export const socketReaction = async (
    io: Server,
    chatId: number,
    messageId: number,
    fromAccessToken: string,
    toAccessToken: string,
    reaction: string | null,
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

        const userId = await axios
            .get('http://localhost:8081/api/metadata/get', {
                headers: {
                    Authorization: `Bearer ${fromAccessToken}`,
                },
            })
            .then((response) => response.data.user_id);

        if (message) {
            if (userId === message.user1_id) message.reaction_sender = reaction;
            else message.reaction_recipient = reaction;

            await redis.set(`chat:${chatId}`, JSON.stringify(chat));
            emitReactionEvent(
                io,
                chatId,
                messageId,
                toAccessToken,
                userId,
                reaction,
            );
        } else {
            message = await messagesRepository.findOneBy({
                chat_id: chatId,
                message_id: messageId,
            });

            if (message) {
                if (userId === message.sender_id)
                    message.reaction_sender = reaction;
                else message.reaction_recipient = reaction;

                await messagesRepository.save(message);
                emitReactionEvent(
                    io,
                    chatId,
                    messageId,
                    toAccessToken,
                    userId,
                    reaction,
                );
            } else {
                throw new Error(`Message with ID ${messageId} not found`);
            }
        }
    } catch (err) {
        console.error('Ошибка в socketReaction:', err);
        io.emit('error', {
            message: 'Ошибка при установке реакции на сообщение',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

const emitReactionEvent = async (
    io: Server,
    chatId: number,
    messageId: number,
    toAccessToken: string,
    userId: string,
    reaction: string | null,
) => {
    try {
        const recipientSocketId = await axios
            .get('http://localhost:8081/api/metadata/get', {
                headers: {
                    Authorization: `Bearer ${toAccessToken}`,
                },
            })
            .then((response) => response.data.socket_id);

        if (!recipientSocketId) {
            throw new Error('User not found');
        }

        io.to(recipientSocketId).emit('message-is-reacted', {
            chatId,
            messageId,
            userId,
            reaction,
        });
    } catch (err) {
        console.log('Ошибка в emitReactionEvent:', err);
        io.emit('error', {
            message: 'Ошибка при отправке события реакции',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
