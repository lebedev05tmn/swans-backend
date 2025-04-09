import axios from 'axios';
import { Socket } from 'socket.io';
import { LessThan } from 'typeorm';
import { chatsRepository, messagesRepository } from '../../shared/config';
import { redis } from '../../shared/model';

interface ChatMessage {
    message_id: number;
    message_text: string;
    sending_time: Date;
    is_readen: boolean;
}

interface ChatInfo {
    chat_id: number;
    user_id: string;
    unread_count: number;
    last_message_text: string;
    last_message_time: Date | null;
}

const getRedisChat = async (chatId: number): Promise<ChatMessage[] | null> => {
    try {
        const data = await redis.get(`chat:${chatId}`);
        if (!data) return null;

        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : null;
    } catch (error) {
        console.error(`Redis parse error for chat ${chatId}:`, error);
        return null;
    }
};

const getCurrentMessageId = async (chatId: number): Promise<number> => {
    try {
        const id = await redis.get(`currentMessageId:${chatId}`);
        return id ? parseInt(id, 10) : 0;
    } catch (error) {
        console.error(
            `Error getting currentMessageId for chat ${chatId}:`,
            error,
        );
        return 0;
    }
};

const mergeLastMessages = (
    redisMsg: ChatMessage | null,
    pgMsg: ChatMessage | null,
): ChatMessage | null => {
    if (!redisMsg) return pgMsg;
    if (!pgMsg) return redisMsg;

    return redisMsg.message_id > pgMsg.message_id ? redisMsg : pgMsg;
};

export const socketGetAllChats = async (
    socket: Socket,
    accessToken: string,
): Promise<void> => {
    try {
        if (!accessToken?.trim()) {
            throw new Error('Invalid access token');
        }

        // Получаем user_id из микросервиса метаданных
        const { data } = await axios.get<{ user_id?: string }>(
            'http://localhost:8081/api/metadata/get',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );

        if (!data?.user_id) {
            throw new Error('User authentication failed');
        }
        const myUserId = data.user_id;

        // Получаем все чаты пользователя
        const userChats = await chatsRepository.find({
            where: [{ user1_id: myUserId }, { user2_id: myUserId }],
            order: { chat_id: 'DESC' },
        });

        if (!userChats?.length) {
            socket.emit('all-chats', []);
            return;
        }

        // Обрабатываем каждый чат
        const chatsData = await Promise.all(
            userChats.map(async (chat): Promise<ChatInfo | null> => {
                try {
                    const chatId = chat.chat_id;
                    const partnerId =
                        chat.user1_id === myUserId
                            ? chat.user2_id
                            : chat.user1_id;

                    // Параллельно получаем данные из Redis
                    const [redisChat, currentRedisMessageId] =
                        await Promise.all([
                            getRedisChat(chatId),
                            getCurrentMessageId(chatId),
                        ]);

                    // Обрабатываем данные из Redis
                    let redisUnread = 0;
                    let redisLastMessage: ChatMessage | null = null;

                    if (redisChat) {
                        redisUnread = redisChat.reduce(
                            (acc, msg) => (!msg.is_readen ? acc + 1 : acc),
                            0,
                        );

                        redisLastMessage =
                            redisChat.length > 0
                                ? redisChat[redisChat.length - 1]
                                : null;
                    }

                    // Условие для Postgres (исключаем сообщения из Redis)
                    const pgWhereCondition =
                        currentRedisMessageId > 0
                            ? { message_id: LessThan(currentRedisMessageId) }
                            : {};

                    // Параллельно получаем данные из Postgres
                    const [pgUnread, pgLastMessage] = await Promise.all([
                        messagesRepository.count({
                            where: {
                                chat_id: chatId,
                                is_readen: false,
                                ...pgWhereCondition,
                            },
                        }),
                        messagesRepository.findOne({
                            where: { chat_id: chatId },
                            order: { message_id: 'DESC' },
                        }),
                    ]);

                    // Собираем финальные данные
                    const totalUnread = redisUnread + pgUnread;
                    const lastMessage = mergeLastMessages(
                        redisLastMessage,
                        pgLastMessage,
                    );

                    return {
                        chat_id: chatId,
                        user_id: partnerId,
                        unread_count: totalUnread,
                        last_message_text: lastMessage?.message_text || '',
                        last_message_time: lastMessage?.sending_time || null,
                    };
                } catch (error) {
                    console.error(
                        `Error processing chat ${chat.chat_id}:`,
                        error,
                    );
                    return null;
                }
            }),
        );

        // Фильтруем возможные null-значения
        const filteredData = chatsData.filter(
            (chat): chat is ChatInfo => chat !== null,
        );

        socket.emit('all-chats', filteredData);
    } catch (error) {
        console.error('Global error in socketGetAllChats:', error);
        socket.emit('error', {
            message: 'Failed to load chats',
            details:
                error instanceof Error
                    ? error.message
                    : 'Internal server error',
        });
    }
};
