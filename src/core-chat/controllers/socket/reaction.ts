import { Socket } from 'socket.io';
import { messagesRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { parseAuthToken } from '../../utils';

export const socketReaction = async (socket: Socket, chatId: number, messageId: number, reaction: string | null) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const message = await messagesRepository.findOneByOrFail({
            chat_id: chat.chat_id,
            message_id: messageId,
        });

        if (message) {
            if (myUserId === message.sender_id) message.reaction_sender = reaction;
            else message.reaction_recipient = reaction;

            const recipientUserId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

            const recipient = await userRepository.findOneByOrFail({
                user_id: recipientUserId,
            });

            if (!recipient) {
                throw new Error('User not found');
            }

            const recipientSocketId = recipient.socket_id;

            if (!recipientSocketId) {
                throw new Error('User not found');
            }

            await messagesRepository.save(message);

            socket.to(recipientSocketId).emit('message-is-reacted', {
                chat_id: chat.chat_id,
                message_id: messageId,
                user_id: myUserId,
                reaction: reaction,
            });
        } else {
            throw new Error(`Message with ID ${messageId} not found`);
        }
    } catch (err) {
        socket.to(socket.id).emit('error', {
            event: 'reaction',
            error: {
                message: 'Ошибка при установке реакции на сообщение',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
