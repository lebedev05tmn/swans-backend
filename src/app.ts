import express from 'express';
import expressBasicAuth from 'express-basic-auth';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { createClient } from 'redis';

import { mediaRouter } from './core-media/routes/media-router';
import { profileRouter } from './core-profile/routes/profile-router';
import { AppDataSource } from './shared/model';
import { options } from './shared/config';
import { authRouter } from './core-auth/routes/auth-router';
import { userRouter } from './core-user/routes/userRouter';
import { contextRouter } from './core-web/context';
import { User } from './core-user/models/entities/User';

export const app = express();
const port = process.env.PORT || 8080;

export const redisClient = createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    }),
);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

app.use('/api', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return next();
    }

    return expressBasicAuth({
        users: {
            admin: process.env.SWAGGER_PASSWORD || 'admin',
        },
        challenge: true,
        unauthorizedResponse: 'Access denied!',
    })(req, res, next);
});

type Anket = {
    user: User;
    score: number;
};

const memory_usage = (arr: Anket[]): number => {
    const start_memory = process.memoryUsage().heapUsed;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const temp_array = [...arr];
    const end_memory = process.memoryUsage().heapUsed;
    return end_memory - start_memory;
};

const get_profiles_and_sort = async () => {
    const start_time = performance.now();

    const all_users: User[] = await AppDataSource.getRepository(User).find();

    const ankets: Anket[] = all_users.map((user) => ({
        user: user,
        score: Math.random() * 100,
    }));

    const sorted_ankets: Anket[] = ankets.sort((a, b) => b.score - a.score);

    const total_time = performance.now() - start_time;

    console.log('Отсортированные анкеты:');
    console.log(sorted_ankets);

    console.log(`Время выполнения процесса для ${await AppDataSource.getRepository(User).count()} пользователей: `);
    console.log(`${total_time} мс`);

    console.log(`Использование памяти = ${memory_usage(ankets)} байт`);
};

AppDataSource.initialize().then(
    () => {
        redisClient.connect().then(
            () => {
                app.use('/api/context', contextRouter);
                app.use('/api/profile', profileRouter);
                app.use('/api/media', mediaRouter);
                app.use('/api/auth', authRouter);
                app.use('/api/metadata', userRouter);
                app.listen(port, () => {
                    console.log(`App listening on port ${port}`);
                });

                get_profiles_and_sort();
            },
            (error) => {
                console.error(error);
            },
        );
    },
    (error) => {
        console.error(error);
    },
);

const swaggerDocs = swaggerJsDoc(options);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
