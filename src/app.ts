import express from 'express';
import expressBasicAuth from 'express-basic-auth';
import { mediaRouter } from './core-media/routes/media-router';
import fileUpload from 'express-fileupload';
import { profileRouter } from './core-profile/routes/profile-router';
import { AppDataSource } from './shared/model';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { options } from './shared/config';
import { authRouter } from './core-auth/routes/auth-router';
import { userRouter } from './core-user/routes/userRouter';
import { contextRouter } from './core-web/context';

export const app = express();
const port = process.env.PORT || 8080;

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

AppDataSource.initialize().then(() => {
    app.use('/api/context', contextRouter);
    app.use('/api/profile', profileRouter);
    app.use('/api/media', mediaRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/metadata', userRouter);

    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});

const swaggerDocs = swaggerJsDoc(options);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
