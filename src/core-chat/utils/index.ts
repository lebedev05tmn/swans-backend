import { Socket } from 'socket.io';
import { chatsRepository } from '../../shared/config';
import { Chat } from '../entities/Chat';
import { decodeUserId } from '../../core-auth/utils/getUserId';
import { HTTP_STATUSES } from '../../shared/utils';

export const createChat = async (id_1: string, id_2: string) => {
    try {
        if (!id_1 || !id_2) {
            throw new Error('Failed to fetch user IDs');
        }

        const existingChat = await chatsRepository.findOne({
            where: [
                { user1_id: id_1, user2_id: id_2 },
                { user1_id: id_2, user2_id: id_1 },
            ],
        });

        if (!existingChat) {
            const chat = Chat.create({
                user1_id: id_1,
                user2_id: id_2,
            });

            await chatsRepository.save(chat);

            return {
                cause: HTTP_STATUSES.CREATED_201,
                chat_id: chat.chat_id,
            };
        }
    } catch (error) {
        return {
            cause: HTTP_STATUSES.BAD_REQUEST_400,
            message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        };
    }
};

export const parseAuthToken = async (socket: Socket, chatId: number) => {
    const myUserId = await decodeUserId(socket.request.headers.authorization);

    const chat = await chatsRepository.findOneOrFail({
        where: [
            { chat_id: chatId, user1_id: myUserId },
            { chat_id: chatId, user2_id: myUserId },
        ],
    });

    if (!chat) {
        throw new Error(`Invalid chat or token`);
    }

    return [myUserId, chat];
};

export const setLocalTime = (sending_time: Date, timezone: string) => {
    const utcDate = new Date(sending_time);
    const localTimeString = utcDate.toLocaleString('en-CA', {
        timeZone: timezone,
        hour12: false,
    });
    const utcTimeString = utcDate.toLocaleString('en-CA', {
        timeZone: 'UTC',
        hour12: false,
    });
    const timezoneOffset = new Date(localTimeString).getTime() - new Date(utcTimeString).getTime();
    const localDate = new Date(utcDate.getTime() + timezoneOffset);
    return new Date(localDate.toISOString());
};
