import { messagesRepository } from '../../../shared/config';
import { Socket } from 'socket.io';
import { userRepository } from '../../../core-user/routes/userRouter';
import { parseAuthToken } from '../../utils';

export const socketEditMessage = async (socket: Socket, chatId: number, messageId: number, messageText: string) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const message = await messagesRepository.findOneByOrFail({
            chat_id: chatId,
            message_id: messageId,
        });

        const recipientUserId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

        if (message) {
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

            message.message_text = messageText;
            await messagesRepository.save(message);

            socket.to(recipientSocketId).emit('message-is-edited', {
                chat_id: chatId,
                message_id: messageId,
                message_text: messageText,
            });
        } else {
            throw new Error(`Message with ID ${messageId} not found in Redis or Postgres`);
        }
    } catch (err) {
        socket.emit('error', {
            event: 'edit-message',
            error: {
                message: 'Ошибка при редактировании сообщения',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
