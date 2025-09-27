import { io } from '../../app';
import { userRepository } from '../../core-user/routes/userRouter';
import { chatsRepository, profileRepository } from '../config';

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    UNAUTHORIZED_401: 401,
    NOT_FOUND_404: 404,

    SERVER_ERROR_500: 500,
};

export const enum FileExtensions {
    JPG = '.jpg',
    JPEG = '.jpeg',
    PNG = '.png',
}

export const enum FileContentTypes {
    JPEG = 'image/jpeg',
    PNG = 'image/png',
}

export enum AuthServiceName {
    TELEGRAM = 'Telegram',
    APPLE = 'Apple',
    VK = 'Vkontakte',
    EMAIL = 'Email',
}

export const profileTableName = 'profile';
export const metadataTableName = 'metadata';

export const pack_size = 30;
export const chatsTableName = 'chats';
export const messagesTableName = 'messages';
export const socketsTableName = 'sockets';

export const emitChatMetadata = async (userId: string, chatId: number) => {
    const profile = await profileRepository.findOneByOrFail({
        user: { user_id: userId },
    });

    const userName = profile.user_name;
    const profilePicture = profile.images[0];

    const user = await userRepository.findOneByOrFail({
        user_id: userId,
    });

    const online = user.online;
    const verify = user.verify;

    const chat = await chatsRepository.findOneByOrFail({ chat_id: chatId });

    const recipientUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;

    const recipient = await userRepository.findOneByOrFail({ user_id: recipientUserId });
    const recipientSocketId = recipient.socket_id;

    io.to(recipientSocketId).emit('chat-metadata', {
        chat_id: chatId,
        name: userName,
        profile_picture: profilePicture,
        online: online,
        verify: verify,
    });
};
