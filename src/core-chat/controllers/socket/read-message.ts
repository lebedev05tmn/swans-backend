import { Server, Socket } from 'socket.io';
import { messagesRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { parseAuthToken } from '../../utils';
import { Chat } from '../../entities/Chat';

export const socketReadMessage = async (io: Server, socket: Socket, chatId: number, messageId: number) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const updateResult = await messagesRepository
            .createQueryBuilder()
            .update()
            .set({ is_readen: true })
            .where('chat_id = :chatId AND message_id <= :messageId', {
                chatId,
                messageId,
            })
            .execute();

        if (updateResult.affected === 0) {
            throw new Error(`Messages in chat ${chatId} up to ${messageId} not found`);
        }

        emitReadEvent(io, socket, myUserId, chat, messageId);
    } catch (err) {
        console.error('Ошибка в socketReadMessage:', err);
        io.emit('error', {
            message: 'Ошибка при отметке сообщения как прочитанного',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

const emitReadEvent = async (io: Server, socket: Socket, myUserId: string, chat: Chat, messageId: number) => {
    try {
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

        io.to(recipientSocketId).emit('message-is-readen', {
            chat_id: chat.chat_id,
            message_id: messageId,
        });
    } catch (err) {
        io.to(socket.id).emit('error', {
            event: 'read-message',
            error: {
                message: 'Ошибка при отправке события прочтения',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
