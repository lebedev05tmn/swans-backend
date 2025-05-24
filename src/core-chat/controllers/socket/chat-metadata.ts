import { Socket } from 'socket.io';
import { profileRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { parseAuthToken } from '../../utils';

export const socketChatMetadata = async (socket: Socket, chatId: number) => {
    try {
        const [myUserId, chat] = await parseAuthToken(socket, chatId);

        const profile = await profileRepository.findOneByOrFail({
            user: { user_id: myUserId },
        });

        const userName = profile.user_name;
        const profilePicture = profile.images[0];

        const user = await userRepository.findOneByOrFail({
            user_id: myUserId,
        });

        const online = user.online;
        const verify = user.verify;

        socket.emit('chat-metadata', {
            chat_id: chat.chat_id,
            name: userName,
            profile_picture: profilePicture,
            online: online,
            verify: verify,
        });
    } catch (err) {
        socket.emit('error', {
            event: 'join-chat',
            error: {
                message: 'Ошибка при подключении к чату',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
