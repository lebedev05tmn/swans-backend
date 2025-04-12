import { Socket } from 'socket.io';
import axios from 'axios';

export const socketRegistration = async (socket: Socket) => {
    try {
        await axios
            .patch(
                `${process.env.AXIOS_HOST}/api/metadata/update`,
                {
                    socket_id: socket.id,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: socket.request.headers.authorization,
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
    }
};
