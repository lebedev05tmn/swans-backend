import { Socket } from 'socket.io';
import { chatsRepository, profileRepository } from '../../shared/config';
import { Chat } from '../entities/Chat';
import axios from 'axios';

export const socketJoin = async (
    socket: Socket,
    accessToken_1: string,
    accessToken_2: string,
) => {
    try {
        if (!accessToken_1 || !accessToken_2) {
            throw new Error('One of access tokens is undefined');
        }

        const [response_1, response_2] = await Promise.all([
            axios.get('http://localhost:8081/api/metadata/get', {
                headers: {
                    Authorization: `Bearer ${accessToken_1}`,
                },
            }),
            axios.get('http://localhost:8081/api/metadata/get', {
                headers: {
                    Authorization: `Bearer ${accessToken_2}`,
                },
            }),
        ]);

        const id_1 = response_1.data.user_id;
        const id_2 = response_2.data.user_id;

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
        }

        socket.emit('joined');
    } catch (err) {
        console.error('Ошибка в socketJoin:', err);
        socket.emit('error', {
            message: 'Ошибка при подключении к чату',
            details: err instanceof Error ? err.message : 'Неизвестная ошибка',
        });
    }
};

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ODZmMWQ3MGQzNTNmMmM3YzAzZmQ5MjVhNjdmNGMwYjBiNjVlNGM5ZjdhOGM2MzNkYjg2YzEzMzZkYjY3OTU1IiwiY3JlYXRlZEF0IjoiMjAyNS0wNC0wOVQxNTozODowMC4xNDFaIiwiaWF0IjoxNzQ0MjEzMDgwLCJleHAiOjE3NDQyOTk0ODB9.X25hLu4iOdXt6jJbxO8cFjrWBY3rB_JzO_k1lbULHG8"
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTgwODkzMzEyNzA5YjQxODMyZDY4MDUxM2M1ZmY2MmUwMWViMzIwNDk0OGUyN2Q1MmMzNTE4NDFhYThlYjk4IiwiY3JlYXRlZEF0IjoiMjAyNS0wNC0wOVQxNTozNToxNC4zODRaIiwiaWF0IjoxNzQ0MjEyOTE0LCJleHAiOjE3NDQyOTkzMTR9.-tiYO1jIL76vQEQXilkvLlsKkxZdUYYMx-jdkmWZwsY"
