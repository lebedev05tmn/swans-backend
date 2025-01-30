import { DataSource } from 'typeorm';
import { Profile } from '../../core-profile/entities/Profile';
import 'dotenv/config';

const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

export const AppDataSource = new DataSource({
    type: 'postgres',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: DB_PORT,
    database: process.env.DB_NAME,
    entities: [Profile],
    synchronize: true,
});
