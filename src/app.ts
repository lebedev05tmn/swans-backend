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
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './core-chat/config';
import { chatRouter } from './core-chat/routes/chat-router';
import { authRouter } from './core-auth/routes/auth-router';
import { userRouter } from './core-user/routes/userRouter';
import { contextRouter } from './core-web/context';
import { startBot } from './core-web/telegram-bot';

export const app = express();
const port = process.env.PORT || 8080;

const server = createServer(app);
export const io = new Server(server);

socketHandler(io);

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

AppDataSource.initialize().then(
    () => {
        redisClient.connect().then(
            () => {
                app.use('/api/context', contextRouter);
                app.use('/api/profile', profileRouter);
                app.use('/api/media', mediaRouter);
                app.use('/api/auth', authRouter);
                app.use('/api/metadata', userRouter);
                app.use('/api/chat', chatRouter);
                server.listen(port, () => {
                    startBot();
                    console.log(`App listening on port ${port}`);
                });
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
