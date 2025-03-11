const { DataSource } = require('typeorm');

const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

module.exports = new DataSource({
    type: 'postgres',
    username: 'postgres',
    password: '123',
    host: '127.0.0.1',
    port: '5432',
    database: 'swans',
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
