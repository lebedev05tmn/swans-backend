import { Socket } from 'socket.io';
import { chatsRepository } from '../../shared/config';
import { Chat } from '../entities/Chat';
import { decodeUserId } from '../../core-auth/utils/getUserId';
import { HTTP_STATUSES } from '../../shared/utils';
import { Message } from '../entities/Message';

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

export const validateToken = async (socket: Socket, chatId: number) => {
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

export const messageWithLocale = (msg: Message, locale: string, timezone: string) => {
    return {
        message_id: msg.message_id,
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        message_text: msg.message_text,
        sending_time: new Date(msg.sending_time).toLocaleString(locale, {
            timeZone: timezone,
        }),
        is_readen: msg.is_readen,
        images: msg.images,
        response_message_id: msg.response_message_id,
        reaction_sender: msg.reaction_sender,
        reaction_recipient: msg.reaction_recipient,
    };
};
