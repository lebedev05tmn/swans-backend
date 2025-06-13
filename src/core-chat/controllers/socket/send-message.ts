import { Socket } from 'socket.io';
import { chatsRepository, profileRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { IMessage, parseAuthToken } from '../../utils';
import { sendOnlineNotification } from '../../../core-notifications/online';

export const socketSendMessage = async (
    socket: Socket,
    messageText: string,
    chatId: number,
    responseMessageId: number | null,
    images: string[] | null,
) => {
    try {
        if (!messageText) {
            throw new Error(`Message text is required`);
        }

        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const recipientId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

        const recipient = await userRepository.findOneByOrFail({
            user_id: recipientId,
        });

        if (!recipient) {
            throw new Error(`Recipient with ID ${recipientId} not found`);
        }

        const recipientSocket = recipient.socket_id;

        if (!recipientSocket) {
            throw new Error(`Recipient with ID ${recipientId} not found`);
        }

        const message: IMessage = {
            id: chat.messages.length === 0 ? 0 : chat.messages.at(-1).id + 1,
            sender_id: myUserId,
            recipient_id: recipientId,
            message_text: messageText,
            sending_time: new Date(),
            is_readen: false,
            images: images ? images : null,
            response_message_id: responseMessageId ? responseMessageId : null,
            reaction_sender: null,
            reaction_recipient: null,
        };

        chat.messages.push(message);
        await chatsRepository.save(chat);

        if (recipient.online) {
            const profile = await profileRepository.findOneByOrFail({
                user: { user_id: myUserId },
            });

            const data = {
                profile: profile,
                text: messageText,
            };

            sendOnlineNotification('new-message', recipientSocket, data);
        }

        message.sending_time = new Date(
            new Date(message.sending_time).toLocaleString(recipient.locale, {
                timeZone: recipient.timezone,
            }),
        );

        socket.to(recipientSocket).emit('new-message', { message: message });
    } catch (err) {
        socket.emit('error', {
            event: 'send-message',
            error: {
                message: 'Ошибка при отправке сообщения',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
