import { Server } from 'socket.io';
import {
    profileRepository,
    chatsRepository,
    messagesRepository,
} from '../../shared/config';
import { Chat } from '../entities/Chat';
import { Message } from '../entities/Message';

export const socketHandler = (io: Server) => {
    io.on('connection', (socket) => {
        let myDatabaseId: string;
        let myUsername: string;

        socket.on('disconnect', async () => {
            const user = await profileRepository.findOneBy({
                socket_id: socket.id,
            });

            if (user) {
                user.socket_id = null;
                await profileRepository.save(user);
            }
        });

        socket.on('join', async (recipientId) => {
            const user = await profileRepository.findOneBy({
                user_id: recipientId,
            });

            if (!user) return;

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
        });

        socket.on(
            'send-private-message',
            async ({ recipientUserId, messageText, chatId }) => {
                const message = Message.create({
                    chat_id: chatId,
                    sender_id: myDatabaseId,
                    recipient_id: recipientUserId,
                    message: messageText,
                });

                await messagesRepository.save(message);

                const recipient = await profileRepository.findOneBy({
                    user_id: recipientUserId,
                });

                if (recipient?.socket_id) {
                    io.to(recipient?.socket_id).emit('add-private-message', {
                        sender: myUsername,
                        messageId: message.message_id,
                        messageText: messageText,
                    });
                }
            },
        );

        socket.on('delete-message', async ({ recipient, messageId }) => {
            await messagesRepository.delete({ message_id: messageId });

            io.to(socket.id).emit('remove-message', messageId);
            io.to(recipient).emit('remove-message', messageId);
        });

        socket.on('registration', async (senderId) => {
            myDatabaseId = senderId;

            const user = await profileRepository.findOneBy({
                user_id: senderId,
            });

            if (user) {
                user.socket_id = socket.id;
                await profileRepository.save(user);

                myUsername = user.user_name;
                socket.emit('registrated', myUsername);
            }
        });
    });
};
