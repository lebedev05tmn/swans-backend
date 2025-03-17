import { Socket } from 'socket.io';
import { profileRepository } from '../../shared/config';

export const socketRegistration = async (socket: Socket, senderId: string) => {
    try {
        const user = await profileRepository.findOneBy({
            user_id: senderId,
        });

        if (!user) {
            throw new Error(`User with ID ${senderId} not found`);
        }

        user.socket_id = socket.id;
        await profileRepository.save(user);

        socket.emit('registrated', user.user_name);

        return [senderId, user.user_name];
    } catch (err) {
        console.error('Ошибка в socketRegistration:', err);
        socket.emit('error', {
            message: 'Ошибка при регистрации сокета',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
        return [senderId, undefined];
    }
};
