import express from 'express';
import { fileRouter } from './core-media/routes/file-router';
import fileUpload from 'express-fileupload';
import { userRouter } from './core-media/routes/user-router';

export const app = express();

app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    }),
);

app.use('/api/user', userRouter);
app.use('/api/file', fileRouter);
