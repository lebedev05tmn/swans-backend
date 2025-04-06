import express from 'express';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import basicAuth from 'express-basic-auth';
import { createClient } from 'redis';

import { mediaRouter } from './core-media/routes/media-router';
import { profileRouter } from './core-profile/routes/profile-router';
import { AppDataSource } from './shared/model';
import { options } from './shared/config';
import { authRouter } from './core-auth/routes/auth-router';

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

AppDataSource.initialize().then(
    () => {
        redisClient.connect().then(
            () => {
                app.use('/api/profile', profileRouter);
                app.use('/api/media', mediaRouter);
                app.use('/api/auth', authRouter);

                app.listen(port, () => {
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

app.use(
    '/api/docs',
    basicAuth({
        users: { admin: `${process.env.SWAGGER_PASSWORD}` },
        challenge: true,
        unauthorizedResponse: 'Access denied!',
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs),
);
