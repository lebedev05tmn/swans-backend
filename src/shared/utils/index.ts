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
export const chatsTableName = 'chats';
export const messagesTableName = 'messages';
export const socketsTableName = 'sockets';
