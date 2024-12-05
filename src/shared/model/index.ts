import { DataSource } from 'typeorm';
import { Profile } from '../../core-profile/entities/Profile';

export const AppDataSource = new DataSource({
    type: 'postgres',
    username: 'postgres',
    password: 'rootpass',
    host: 'localhost',
    port: 5432,
    database: 'swans',
    entities: [Profile],
    synchronize: true,
});
