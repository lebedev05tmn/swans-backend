const { DataSource } = require('typeorm');

const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

module.exports = new DataSource({
    type: 'postgres',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    port: DB_PORT,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: ['src/core-profile/entities/Profile.ts'],
    migrations: ['migrations/*.ts'],
    cli: {
        migrationsDir: 'migrations',
    },
});
