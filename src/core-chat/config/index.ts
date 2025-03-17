import { Server } from 'socket.io';
import { socketRegistration } from '../controllers/registration';
import { socketJoin } from '../controllers/join';
import { socketPaginate } from '../controllers/paginate';
import { socketSendMessage } from '../controllers/send-message';
import { socketOffline } from '../controllers/offline';
import { socketDisconnect } from '../controllers/disconnect';
import { socketDeleteMessage } from '../controllers/delete-message';
import { socketReadMessage } from '../controllers/read-message';
import { socketEditMessage } from '../controllers/edit-message';

export const socketHandler = (io: Server) => {
    io.on('connection', (socket) => {
        let myDatabaseId: string | undefined;
        let myUsername: string | undefined;

        socket.on('disconnect', async () => {
            await socketDisconnect(socket);
        });

        socket.on('join', async (recipientId) => {
            await socketJoin(socket, recipientId, myDatabaseId);
        });

        socket.on('offline', async ({ chatId }) => {
            await socketOffline(chatId);
        });

        socket.on(
            'send-message',
            async ({ recipientUserId, messageText, chatId }) => {
                await socketSendMessage(
                    io,
                    recipientUserId,
                    messageText,
                    chatId,
                    myUsername,
                    myDatabaseId,
                );
            },
        );

        socket.on('paginate', async ({ chatId, page }) => {
            await socketPaginate(socket, chatId, page);
        });

        socket.on('read-message', async ({ chatId, messageId }) => {
            await socketReadMessage(io, chatId, messageId);
        });

        socket.on(
            'edit-message',
            async ({ chatId, messageId, messageText }) => {
                await socketEditMessage(io, chatId, messageId, messageText);
            },
        );

        socket.on(
            'delete-message',
            async ({ recipientUserId, chatId, messageId }) => {
                await socketDeleteMessage(
                    io,
                    socket,
                    recipientUserId,
                    chatId,
                    messageId,
                );
            },
        );

        socket.on('registration', async (senderId) => {
            [myDatabaseId, myUsername] = await socketRegistration(
                socket,
                senderId,
            );
        });
    });
};
