import { messagesRepository } from '../../../shared/config';
import { Server, Socket } from 'socket.io';
import { userRepository } from '../../../core-user/routes/userRouter';
import { parseAuthToken } from '../../utils';

export const socketEditMessage = async (
    io: Server,
    socket: Socket,
    chatId: number,
    messageId: number,
    messageText: string,
) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const message = await messagesRepository.findOneByOrFail({
            chat_id: chatId,
            message_id: messageId,
        });

        const recipientUserId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

        if (message) {
            message.message_text = messageText;
            await messagesRepository.save(message);
            emitEditEvent(io, socket, recipientUserId, chatId, messageId, messageText);
        } else {
            throw new Error(`Message with ID ${messageId} not found in Redis or Postgres`);
        }
    } catch (err) {
        io.to(socket.id).emit('message-is-edited', {
            success: false,
            message: 'Ошибка при редактировании сообщения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

const emitEditEvent = async (
    io: Server,
    socket: Socket,
    recipientUserId: string,
    chatId: number,
    messageId: number,
    messageText: string,
) => {
    try {
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

        io.to(recipientSocketId).emit('message-is-edited', {
            chat_id: chatId,
            message_id: messageId,
            message_text: messageText,
        });
    } catch (err) {
        io.to(socket.id).emit('error', {
            event: 'edit-message',
            error: {
                message: 'Ошибка при отправке события редактирования',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
