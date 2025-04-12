import { Server, Socket } from 'socket.io';
import { messagesRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { Message } from '../../entities/Message';
import { messageWithLocale, validateToken } from '../../utils';

export const socketSendMessage = async (
    io: Server,
    socket: Socket,
    messageText: string,
    chatId: number,
    responseTo: number | null,
    images: string[] | null,
) => {
    try {
        const [myUserId, chat] = await validateToken(socket, chatId);

        const lastMessage = await messagesRepository.findOne({
            where: { chat_id: chatId },
            order: { message_id: 'DESC' },
        });

        const newMessageId = lastMessage ? lastMessage.message_id + 1 : 1;

        const recipientId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

        const message = Message.create({
            message_id: newMessageId,
            chat_id: chatId,
            sender_id: myUserId,
            recipient_id: recipientId,
            message_text: messageText,
            sending_time: new Date(),
            is_readen: false,
            images: images ? images : null,
            response_message_id: responseTo ? responseTo : null,
            reaction_sender: null,
            reaction_recipient: null,
        });

        await messagesRepository.save(message);

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

        io.to(recipientSocket).emit('new-message', messageWithLocale(message, recipient.locale, recipient.timezone));
    } catch (err) {
        console.error('Ошибка в socketSendMessage:', err);
        io.emit('error', {
            message: 'Ошибка при отправке сообщения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
