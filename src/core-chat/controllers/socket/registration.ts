import { Socket } from 'socket.io';
import { decodeUserId } from '../../../core-auth/utils/getUserId';
import { userRepository } from '../../../core-user/routes/userRouter';

export const socketRegistration = async (socket: Socket) => {
    try {
        const userId = await decodeUserId(socket.request.headers.authorization);

        const user = await userRepository.findOneByOrFail({
            user_id: userId,
        });

        user.socket_id = socket.id;
        await userRepository.save(user);

        socket.emit('registrated', { socket_id: socket.id });
    } catch (err) {
        socket.emit('error', {
            event: 'registration',
            error: {
                message: 'Ошибка при регистрации сокета',
                details: err instanceof Error ? err.message : 'Неизвестная ошибка',
            },
        });
    }
};
