import { Socket } from 'socket.io';
import { messagesRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { Message } from '../../entities/Message';
import { parseAuthToken } from '../../utils';

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

        const lastMessage = await messagesRepository.findOne({
            where: { chat_id: chatId },
            order: { message_id: 'DESC' },
        });

        const newMessageId = lastMessage ? lastMessage.message_id + 1 : 1;

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

        const message = Message.create({
            message_id: newMessageId,
            chat_id: chatId,
            sender_id: myUserId,
            recipient_id: recipientId,
            message_text: messageText,
            sending_time: new Date(),
            is_readen: false,
            images: images ? images : null,
            response_message_id: responseMessageId ? responseMessageId : null,
            reaction_sender: null,
            reaction_recipient: null,
        });

        await messagesRepository.save(message);

        message.sending_time = new Date(
            new Date(message.sending_time).toLocaleString(recipient.locale, {
                timeZone: recipient.timezone,
            }),
        );

        socket.to(recipientSocket).emit('new-message', { message: message });
    } catch (err) {
        socket.to(socket.id).emit('error', {
            event: 'send-message',
            error: {
                message: 'Ошибка при отправке сообщения',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
