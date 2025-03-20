const { DataSource } = require('typeorm');
require('dotenv').config();

const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

module.exports = new DataSource({
    type: 'postgres',
    username: process.env.DB_USERNAME.toString(),
    password: process.env.DB_PASSWORD.toString(),
    host: process.env.DB_HOST,
    port: DB_PORT,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [
        'dist/core-profile/entities/Profile.js',
        'dist/core-user/models/entities/User.js',
        'dist/core-auth/models/entities/Auth.js',
    ],
    migrations: ['dist/migrations/*.js'],
    cli: {
        migrationsDir: 'src/migrations',
    },
});
