import express from 'express';
import { fileRouter } from './core-media/routes/file-router';
import fileUpload from 'express-fileupload';

export const app = express();

app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    }),
);

app.use('/file', fileRouter);
