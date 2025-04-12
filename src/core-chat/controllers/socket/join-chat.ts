import { Socket } from 'socket.io';
import { profileRepository } from '../../../shared/config';
import { userRepository } from '../../../core-user/routes/userRouter';
import { validateToken } from '../../utils';

export const socketJoinChat = async (socket: Socket, chatId: number) => {
    try {
        const [myUserId, chat] = await validateToken(socket, chatId);

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

        const response = {
            chat_id: chat.chat_id,
            name: userName,
            profile_picture: profilePicture,
            online: online,
            verify: verify,
        };

        socket.emit('joined', response);
    } catch (err) {
        console.error('Ошибка в socketJoin:', err);
        socket.emit('error', {
            message: 'Ошибка при подключении к чату',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};
