import express from 'express';
import { fileRouter } from './core-media/routes/file-router';
import fileUpload from 'express-fileupload';
import { userRouter } from './core-profile/routes/user-router';
import { AppDataSource } from './shared/model';
import { Profile } from './core-profile/entities/Profile';
import { initMedia } from './core-media';

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    }),
);

initMedia();

AppDataSource.initialize().then(() => {
    app.use('/api/user', userRouter);
    app.use('/api/file', fileRouter);
    app.listen(port, () => {
        console.log(`Minio client app listening on port ${port}`);
    });
});
export const userRepository = AppDataSource.getRepository(Profile);
