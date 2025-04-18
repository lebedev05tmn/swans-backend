import { Server, Socket } from 'socket.io';
import { messagesRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { parseAuthToken } from '../../utils';
import { Chat } from '../../entities/Chat';

export const socketReaction = async (
    io: Server,
    socket: Socket,
    chatId: number,
    messageId: number,
    reaction: string | null,
) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const message = await messagesRepository.findOneByOrFail({
            chat_id: chat.chat_id,
            message_id: messageId,
        });

        if (message) {
            if (myUserId === message.sender_id) message.reaction_sender = reaction;
            else message.reaction_recipient = reaction;

            await messagesRepository.save(message);
            emitReactionEvent(io, socket, chat, messageId, myUserId, reaction);
        } else {
            throw new Error(`Message with ID ${messageId} not found`);
        }
    } catch (err) {
        console.error('Ошибка в socketReaction:', err);
        io.emit('error', {
            message: 'Ошибка при установке реакции на сообщение',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

const emitReactionEvent = async (
    io: Server,
    socket: Socket,
    chat: Chat,
    messageId: number,
    myUserId: string,
    reaction: string | null,
) => {
    try {
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

        io.to(recipientSocketId).emit('message-is-reacted', {
            chat_id: chat.chat_id,
            message_id: messageId,
            user_id: myUserId,
            reaction: reaction,
        });
    } catch (err) {
        io.to(socket.id).emit('error', {
            event: 'reaction',
            error: {
                message: 'Ошибка при отправке события реакции',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
