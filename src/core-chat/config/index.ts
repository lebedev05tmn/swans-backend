import { Server } from 'socket.io';
import { socketRegistration } from '../controllers/registration';
import { socketJoin } from '../controllers/join';
import { socketSendMessage } from '../controllers/send-message';
import { socketOffline } from '../controllers/offline';
import { socketDisconnect } from '../controllers/disconnect';
import { socketDeleteMessage } from '../controllers/delete-message';
import { socketReadMessage } from '../controllers/read-message';
import { socketEditMessage } from '../controllers/edit-message';
import { socketReaction } from '../controllers/reaction';
import { socketGetAllChats } from '../controllers/get-all-chats';

export const socketHandler = (io: Server) => {
    io.on('connection', (socket) => {
        socket.on('disconnect', async () => {
            await socketDisconnect(socket);
        });

        socket.on('join', async ({ accessToken_1, accessToken_2 }) => {
            await socketJoin(socket, accessToken_1, accessToken_2);
        });

        socket.on('offline', async ({ chatId }) => {
            await socketOffline(chatId);
        });

        socket.on(
            'send-message',
            async ({
                fromAccessToken,
                toAccessToken,
                messageText,
                chatId,
                responseTo,
                images,
            }) => {
                await socketSendMessage(
                    io,
                    fromAccessToken,
                    toAccessToken,
                    messageText,
                    chatId,
                    responseTo,
                    images,
                );
            },
        );

        socket.on(
            'read-message',
            async ({ chatId, messageId, recipientAccessToken }) => {
                await socketReadMessage(
                    io,
                    chatId,
                    messageId,
                    recipientAccessToken,
                );
            },
        );

        socket.on(
            'reaction',
            async ({
                chatId,
                messageId,
                fromAccessToken,
                toAccessToken,
                reaction,
            }) => {
                await socketReaction(
                    io,
                    chatId,
                    messageId,
                    fromAccessToken,
                    toAccessToken,
                    reaction,
                );
            },
        );

        socket.on(
            'edit-message',
            async ({
                recipientAccessToken,
                chatId,
                messageId,
                messageText,
            }) => {
                await socketEditMessage(
                    io,
                    recipientAccessToken,
                    chatId,
                    messageId,
                    messageText,
                );
            },
        );

        socket.on(
            'delete-message',
            async ({ recipientAccessToken, chatId, messageId }) => {
                await socketDeleteMessage(
                    io,
                    socket,
                    recipientAccessToken,
                    chatId,
                    messageId,
                );
            },
        );

        socket.on('registration', async ({ accessToken }) => {
            await socketRegistration(socket, accessToken);
        });

        socket.on('get-chat-metadata', async ({ accessToken }) => {
            await socketGetAllChats(socket, accessToken);
        });
    });
};
