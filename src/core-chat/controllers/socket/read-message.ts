import { Server, Socket } from 'socket.io';
import { messagesRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { validateToken } from '../../utils';
import { Chat } from '../../entities/Chat';

export const socketReadMessage = async (io: Server, socket: Socket, chatId: number, messageId: number) => {
    try {
        const [myUserId, chat] = await validateToken(socket, chatId);

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

        emitReadEvent(io, myUserId, chat, messageId);
    } catch (err) {
        console.error('Ошибка в socketReadMessage:', err);
        io.emit('error', {
            message: 'Ошибка при отметке сообщения как прочитанного',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

const emitReadEvent = async (io: Server, myUserId: string, chat: Chat, messageId: number) => {
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
        console.log('Ошибка в emitReadEvent:', err);
        io.emit('error', {
            message: 'Ошибка при отправке события прочтения',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
