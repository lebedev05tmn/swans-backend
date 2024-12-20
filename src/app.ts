import express from 'express';
import { mediaRouter } from './core-media/routes/media-router';
import fileUpload from 'express-fileupload';
import { profileRouter } from './core-profile/routes/profile-router';
import { AppDataSource } from './shared/model';
import { initMedia } from './core-media';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { options } from './shared/config';

export const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    }),
);

initMedia();

AppDataSource.initialize().then(() => {
    app.use('/api/profile', profileRouter);
    app.use('/api/media', mediaRouter);

    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});

const swaggerDocs = swaggerJsDoc(options);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
