import { Server } from 'socket.io';
import { socketRegistration } from '../controllers/socket/registration';
import { socketChatMetadata } from '../controllers/socket/chat-metadata';
import { socketSendMessage } from '../controllers/socket/send-message';
import { socketDeleteMessage } from '../controllers/socket/delete-message';
import { socketReadMessage } from '../controllers/socket/read-message';
import { socketEditMessage } from '../controllers/socket/edit-message';
import { socketReaction } from '../controllers/socket/reaction';

export const socketHandler = (io: Server) => {
    io.on('connection', (socket) => {
        socket.on('disconnect', async () => {
            socket.disconnect();
        });

        socket.on('join-chat', async ({ chatId }) => {
            await socketChatMetadata(socket, chatId);
        });

        socket.on('send-message', async ({ messageText, chatId, responseMessageId, images }) => {
            await socketSendMessage(socket, messageText, chatId, responseMessageId, images);
        });

        socket.on('read-message', async ({ chatId, messageId }) => {
            await socketReadMessage(socket, chatId, messageId);
        });

        socket.on('reaction', async ({ chatId, messageId, reaction }) => {
            await socketReaction(socket, chatId, messageId, reaction);
        });

        socket.on('edit-message', async ({ chatId, messageId, messageText }) => {
            await socketEditMessage(socket, chatId, messageId, messageText);
        });

        socket.on('delete-message', async ({ chatId, messageId }) => {
            await socketDeleteMessage(socket, chatId, messageId);
        });

        socket.on('registration', async () => {
            await socketRegistration(socket);
        });
    });
};
