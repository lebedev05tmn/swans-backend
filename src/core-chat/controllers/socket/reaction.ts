import { Socket } from 'socket.io';
import { userRepository } from '../../../core-user/routes/userRouter';
import { IMessage, parseAuthToken } from '../../utils';
import { chatsRepository, profileRepository } from '../../../shared/config';
import { sendOnlineNotification } from '../../../core-notifications/online';

export const socketReaction = async (socket: Socket, chatId: number, messageId: number, reaction: string | null) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const messageIndex = chat.messages.findIndex((msg: IMessage) => msg.id === messageId);

        if (messageIndex === -1) {
            throw new Error(`Message with ID ${messageId} not found`);
        }

        if (chat.messages[messageIndex]) {
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

            if (myUserId === chat.messages[messageIndex].sender_id)
                chat.messages[messageIndex].reaction_sender = reaction;
            else chat.messages[messageIndex].reaction_recipient = reaction;

            await chatsRepository.save(chat);

            socket.to(recipientSocketId).emit('message-is-reacted', {
                chat_id: chat.chat_id,
                message_id: messageId,
                user_id: myUserId,
                reaction: reaction,
            });

            if (recipient.online) {
                const profile = await profileRepository.findOneByOrFail({
                    user: { user_id: myUserId },
                });

                const data = {
                    profile: profile,
                    message_id: messageId,
                    reaction: reaction,
                };

                sendOnlineNotification('reaction', recipientSocketId, data);
            }
        } else {
            throw new Error(`Message with ID ${messageId} not found`);
        }
    } catch (err) {
        socket.emit('error', {
            event: 'reaction',
            error: {
                message: 'Ошибка при установке реакции на сообщение',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
