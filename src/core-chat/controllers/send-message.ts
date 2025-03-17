import { Server } from 'socket.io';
import { messagesRepository, profileRepository } from '../../shared/config';
import { redis } from '../../shared/model';

export const socketSendMessage = async (
    io: Server,
    recipientUserId: string,
    messageText: string,
    chatId: number,
    myUsername: string | undefined,
    myDatabaseId: string | undefined,
) => {
    try {
        if (!myDatabaseId || !myUsername) {
            throw new Error('myDatabaseId or myUsername is undefined');
        }

        const redisKeyCurrentId = `currentMessageId:${chatId}`;
        const keyChat = `chat:${chatId}`;

        const lastMessage = await messagesRepository.findOne({
            where: { chat_id: chatId },
            order: { message_id: 'DESC' },
        });

        const newMessageId = lastMessage ? lastMessage.message_id + 1 : 1;
        await redis.set(redisKeyCurrentId, newMessageId);

        const message = {
            message_id: newMessageId,
            chat_id: chatId,
            sender_id: myDatabaseId,
            recipient_id: recipientUserId,
            message_text: messageText,
            sending_time: new Date(),
            is_readen: false,
            reading_time: null,
        };

        const chatExists = await redis.exists(keyChat);
        let messagesArray: any[] = [];

        if (chatExists) {
            const rawData = await redis.get(keyChat);
            messagesArray = rawData ? JSON.parse(rawData) : [];
        }

        messagesArray.push(message);
        await redis.set(keyChat, JSON.stringify(messagesArray));

        const recipient = await profileRepository.findOneBy({
            user_id: recipientUserId,
        });

        if (!recipient) {
            throw new Error(`Recipient with ID ${recipientUserId} not found`);
        }

        if (recipient.socket_id) {
            io.to(recipient.socket_id).emit('add-message', {
                sender: myUsername,
                messageId: newMessageId,
                messageText: messageText,
            });
        }
    } catch (err) {
        console.error('Ошибка в socketSendMessage:', err);
        io.emit('error', {
            message: 'Ошибка при отправке сообщения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
