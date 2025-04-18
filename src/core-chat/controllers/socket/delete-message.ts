import { messagesRepository } from '../../../shared/config';
import { Server, Socket } from 'socket.io';
import { userRepository } from '../../../core-user/routes/userRouter';
import { parseAuthToken } from '../../utils';

export const socketDeleteMessage = async (io: Server, socket: Socket, chatId: number, messageId: number) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const deleteResult = await messagesRepository.delete({
            chat_id: chatId,
            message_id: messageId,
        });

        if (deleteResult.affected === 0) {
            throw new Error(`Message with ID ${messageId} not found`);
        }

        const recipientUserId = chat.user1_id === myUserId ? chat.user2_id : chat.user1_id;

        const recipient = await userRepository.findOneByOrFail({
            user_id: recipientUserId,
        });

        if (!recipient) {
            throw new Error(`Recipient not found`);
        }

        const recipientSocketId = recipient.socket_id;

        if (!recipientSocketId) {
            throw new Error(`Recipient not found`);
        }

        io.to(recipientSocketId).emit('message-is-deleted', { chat_id: chatId, message_id: messageId });
    } catch (err) {
        io.to(socket.id).emit('error', {
            event: 'delete-message',
            error: {
                message: 'Ошибка при удалении сообщения',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
