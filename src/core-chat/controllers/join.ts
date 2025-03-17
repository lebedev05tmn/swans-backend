import { Socket } from 'socket.io';
import { chatsRepository, profileRepository } from '../../shared/config';
import { Chat } from '../entities/Chat';

export const socketJoin = async (
    socket: Socket,
    recipientId: string,
    myDatabaseId: string | undefined,
) => {
    try {
        if (!myDatabaseId) {
            throw new Error('myDatabaseId is undefined');
        }

        const user = await profileRepository.findOneBy({
            user_id: recipientId,
        });

        if (!user) {
            throw new Error(`Recipient with ID ${recipientId} not found`);
        }

        const existingChat = await chatsRepository.findOne({
            where: [
                { user1_id: myDatabaseId, user2_id: recipientId },
                { user1_id: recipientId, user2_id: myDatabaseId },
            ],
        });

        if (!existingChat) {
            const chat = Chat.create({
                user1_id: myDatabaseId,
                user2_id: recipientId,
            });

            await chatsRepository.save(chat);
        }

        socket.emit('joined', {
            recipientSocketId: user.socket_id || null,
            recipientName: user.user_name,
        });
    } catch (err) {
        console.error('Ошибка в socketJoin:', err);
        socket.emit('error', {
            message: 'Ошибка при подключении к чату',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
