import express from 'express';
import { fileRouter } from './core-media/routes/file-router';
import fileUpload from 'express-fileupload';
import { userRouter } from './core-profile/routes/user-router';
import { AppDataSource } from './shared/model';
import { Profile } from './core-profile/entities/Profile';
import { initMedia } from './core-media';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

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
    app.use('/api/user', userRouter);
    app.use('/api/file', fileRouter);

    app.listen(port, () => {
        console.log(`Minio client app listening on port ${port}`);
    });
});

export const userRepository = AppDataSource.getRepository(Profile);

const routes = ['./src/**/routes/*.ts'];

const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'REST API',
            version: '0.0.1',
            description: 'Swagger Implementations in Node js',
        },
        servers: [
            {
                url: `http://127.0.0.1:3000`,
                description: 'V1 Local Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: routes,
};

const swaggerDocs = swaggerJsDoc(options);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
