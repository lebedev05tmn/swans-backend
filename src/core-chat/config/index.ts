import { Server } from 'socket.io';
import { socketRegistration } from '../controllers/socket/registration';
import { socketJoinChat } from '../controllers/socket/join-chat';
import { socketSendMessage } from '../controllers/socket/send-message';
import { socketDeleteMessage } from '../controllers/socket/delete-message';
import { socketReadMessage } from '../controllers/socket/read-message';
import { socketEditMessage } from '../controllers/socket/edit-message';
import { socketReaction } from '../controllers/socket/reaction';
import { socketGetAllChats } from '../controllers/socket/get-all-chats';

export const socketHandler = (io: Server) => {
    io.on('connection', (socket) => {
        socket.on('disconnect', async () => {
            socket.disconnect();
        });

        socket.on('join-chat', async ({ chatId }) => {
            await socketJoinChat(socket, chatId);
        });

        socket.on('send-message', async ({ messageText, chatId, responseTo, images }) => {
            await socketSendMessage(io, socket, messageText, chatId, responseTo, images);
        });

        socket.on('read-message', async ({ chatId, messageId }) => {
            await socketReadMessage(io, socket, chatId, messageId);
        });

        socket.on('reaction', async ({ chatId, messageId, reaction }) => {
            await socketReaction(io, socket, chatId, messageId, reaction);
        });

        socket.on('edit-message', async ({ chatId, messageId, messageText }) => {
            await socketEditMessage(io, socket, chatId, messageId, messageText);
        });

        socket.on('delete-message', async ({ chatId, messageId }) => {
            await socketDeleteMessage(io, socket, chatId, messageId);
        });

        socket.on('registration', async () => {
            await socketRegistration(socket);
        });

        socket.on('get-all-chats', async () => {
            await socketGetAllChats(socket);
        });
    });
};
