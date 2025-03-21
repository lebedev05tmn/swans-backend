import { DataSource } from 'typeorm';
import { Profile } from '../../core-profile/entities/Profile';
import 'dotenv/config';
import { Chat } from '../../core-chat/entities/Chat';
import { Message } from '../../core-chat/entities/Message';
import { createClient } from 'redis';

const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

export const AppDataSource = new DataSource({
    type: 'postgres',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: DB_PORT,
    database: process.env.DB_NAME,
    entities: [Profile, Chat, Message],
    synchronize: true,
});

export const redis = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
});
