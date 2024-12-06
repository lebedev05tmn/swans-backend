import { DataSource } from 'typeorm';
import { Profile } from '../../core-profile/entities/Profile';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: 'postgres',
    username: 'postgres',
    password: process.env.TYPEORM_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: 'swans',
    entities: [Profile],
    synchronize: true,
});
