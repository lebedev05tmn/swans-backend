import { Request, Response } from 'express';
import { decodeUserId } from '../../../core-auth/utils/getUserId';
import { chatsRepository, profileRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { setLocalTime } from '../../utils';

export const getAllChats = async (req: Request, res: Response) => {
    try {
        const myUserId = await decodeUserId(req.headers.authorization);

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

                    const chat = await chatsRepository.findOneByOrFail({
                        chat_id: chatId,
                    });
                    const messages = chat.messages;

                    if (!messages || messages.length === 0) throw new Error('Chat is empty');

                    const unreadCount = messages.filter(
                        (message) => message.recipient_id === myUserId && !message.is_readen,
                    ).length;

                    const lastMessage = [...messages].sort(
                        (a, b) => new Date(b.sending_time).getTime() - new Date(a.sending_time).getTime(),
                    )[0];

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

                    lastMessage.sending_time = setLocalTime(lastMessage.sending_time, user.timezone);

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
                        last_message_time: lastMessage.sending_time,
                        locale: user.locale,
                    };
                } catch (error) {
                    console.error(`Error processing chat ${currentChat.chat_id}:`, error);
                    return null;
                }
            }),
        );

        const filteredOutput = output.filter((item) => item !== null);

        res.status(200).json(filteredOutput);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to get chats',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
