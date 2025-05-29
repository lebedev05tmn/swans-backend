import { chatsRepository } from '../../../shared/config';
import { Socket } from 'socket.io';
import { userRepository } from '../../../core-user/routes/userRouter';
import { IMessage, parseAuthToken } from '../../utils';

export const socketEditMessage = async (socket: Socket, chatId: number, messageId: number, messageText: string) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const recipientUserId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

        const messageIndex = chat.messages.findIndex((msg: IMessage) => msg.id === messageId);

        if (messageIndex === -1) {
            throw new Error(`Message with ID ${messageId} not found`);
        }

        if (chat.messages[messageIndex]) {
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

            chat.messages[messageIndex].message_text = messageText;
            await chatsRepository.save(chat);

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
