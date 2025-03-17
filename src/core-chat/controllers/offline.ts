import { messagesRepository } from '../../shared/config';
import { redis } from '../../shared/model';
import { Message } from '../entities/Message';

export const socketOffline = async (chatId: number) => {
    const data = await redis
        .get(`chat:${chatId}`)
        .then((data) => JSON.parse(data!));

    if (!data) return;

    for (let i = 0; i < data.length; i++) {
        const message = Message.create(data[i]);
        await messagesRepository.save(message);
    }

    await redis.del(`chat:${chatId}`);
    await redis.del(`currentMessageId:${chatId}`);
};
