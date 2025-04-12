import { Socket } from 'socket.io';
import { decodeUserId } from '../../../core-auth/utils/getUserId';
import { chatsRepository, messagesRepository, profileRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { messageWithLocale } from '../../utils';

export const socketGetAllChats = async (socket: Socket) => {
    try {
        const myUserId = await decodeUserId(socket.request.headers.authorization);

        if (!myUserId) {
            throw new Error('Access token is required');
        }

        const chats = await chatsRepository.find({
            where: [{ user1_id: myUserId }, { user2_id: myUserId }],
            order: { chat_id: 'DESC' },
        });

        const output = await Promise.all(
            chats.map(async (currentChat) => {
                try {
                    const userId = myUserId === currentChat.user1_id ? currentChat.user2_id : currentChat.user1_id;

                    const chatId = currentChat.chat_id;

                    const unreadCount = await messagesRepository.count({
                        where: {
                            chat_id: chatId,
                            is_readen: false,
                        },
                    });

                    const lastMessage = await messagesRepository.findOneOrFail({
                        where: { chat_id: chatId },
                        order: { message_id: 'DESC' },
                    });

                    const profile = await profileRepository.findOneByOrFail({
                        user: { user_id: myUserId },
                    });

                    const userName = profile.user_name;
                    const today = new Date();
                    const age = today.getFullYear() - profile.birth_date.getFullYear();
                    const profilePicture = profile.images[0];

                    const user = await userRepository.findOneByOrFail({
                        user_id: myUserId,
                    });

                    const lastMessageSendingTime = messageWithLocale(lastMessage, user.locale, user.timezone);

                    const online = user.online;
                    const verify = user.verify;

                    return {
                        chat_id: chatId,
                        user_id: userId,
                        name: userName,
                        age: age,
                        profile_picture: profilePicture,
                        online: online,
                        verify: verify,
                        unread_count: unreadCount || 0,
                        last_message_text: lastMessage?.message_text,
                        last_message_time: lastMessageSendingTime,
                    };
                } catch (error) {
                    console.error(`Error processing chat ${currentChat.chat_id}:`, error);
                    return null;
                }
            }),
        );

        const filteredOutput = output.filter((item) => item !== null);

        socket.emit('all-chats', filteredOutput);
    } catch (error) {
        console.error('Error in socketGetAllChats:', error);
        socket.emit('error', {
            message: 'Failed to get chats',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
