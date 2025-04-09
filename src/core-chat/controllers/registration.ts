import { Socket } from 'socket.io';
import axios from 'axios';

export const socketRegistration = async (
    socket: Socket,
    accessToken: string,
) => {
    try {
        await axios
            .patch(
                'http://localhost:8081/api/metadata/update',
                {
                    socket_id: socket.id,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            )
            .then((response) => {
                socket.emit('registrated', response.data);
            });
    } catch (err) {
        console.error('Ошибка в socketRegistration:', err);
        socket.emit('error', {
            message: 'Ошибка при регистрации сокета',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
        return [accessToken, undefined];
    }
};
