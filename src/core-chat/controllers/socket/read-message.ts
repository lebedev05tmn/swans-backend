import { Socket } from 'socket.io';
import { userRepository } from '../../../core-user/routes/userRouter';
import { IMessage, parseAuthToken } from '../../utils';
import { chatsRepository } from '../../../shared/config';

export const socketReadMessage = async (socket: Socket, chatId: number, messageId: number) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const recipientUserId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

        const recipient = await userRepository.findOneByOrFail({
            user_id: recipientUserId,
        });

        if (!recipient) {
            throw new Error('Recipient not found');
        }

        const recipientSocketId = recipient.socket_id;

        if (!recipientSocketId) {
            throw new Error("Recipient's socket id not found");
        }

        const messageIndex = chat.messages.findIndex((msg: IMessage) => msg.id === messageId);

        if (messageIndex === -1) {
            throw new Error(`Message with ID ${messageId} not found`);
        }

        for (let i = messageIndex; i >= 0; i--) {
            const message = chat.messages[i];

            if (message.sender_id !== recipientUserId) continue;
            if (message.is_readen) break;

            message.is_readen = true;
        }

        await chatsRepository.save(chat);

        socket.to(recipientSocketId).emit('message-is-readen', {
            chat_id: chat.chat_id,
            message_id: messageId,
        });
    } catch (err) {
        socket.emit('error', {
            event: 'read-message',
            error: {
                message: 'Ошибка при отметке сообщения как прочитанного',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
