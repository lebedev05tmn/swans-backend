import express from 'express';
import { mediaRouter } from './core-media/routes/media-router';
import fileUpload from 'express-fileupload';
import { profileRouter } from './core-profile/routes/profile-router';
import { AppDataSource, redis } from './shared/model';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { options } from './shared/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './core-chat/config';
import { chatRouter } from './core-chat/routes/chat-router';

export const app = express();
const port = process.env.PORT || 8080;

const server = createServer(app);
const io = new Server(server);

socketHandler(io);

const redisInit = async () => {
    redis.on('error', (error) => console.log(`Redis client error: ${error}`));
    await redis.connect();
};
redisInit();

app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    }),
);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

AppDataSource.initialize().then(() => {
    app.use('/api/profile', profileRouter);
    app.use('/api/media', mediaRouter);
    app.use('/api/chat', chatRouter);

    server.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});

const swaggerDocs = swaggerJsDoc(options);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
