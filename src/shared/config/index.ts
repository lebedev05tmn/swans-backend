import path from 'path';
import { AppDataSource } from '../model';
import { Profile } from '../../core-profile/entities/Profile';
import { FileContentTypes, FileExtensions } from '../utils';

export const bucketName = 'ed801ea0-cd711ac8-b8f5-4d49-9ce4-0c272318ef45';
export const profileRepository = AppDataSource.getRepository(Profile);

export const getFileContentType = async (objectKey: string) => {
    switch (path.extname(<string>objectKey)) {
        case FileExtensions.JPG:
            return FileContentTypes.JPEG;
        case FileExtensions.JPEG:
            return FileContentTypes.JPEG;
        case FileExtensions.PNG:
            return FileContentTypes.PNG;
    }
};

const routes = ['./**/routes/*.ts'];

export const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'SWANS',
            version: '0.0.1',
            description: 'Swagger Implementations in Node js',
        },
        servers: [
            {
                url:
                    process.env.NODE_ENV == 'production'
                        ? process.env.SERVER_HOST
                        : process.env.LOCAL_HOST,
                description: 'V1 Local Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'https',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                basicAuth: {
                    type: 'https',
                    scheme: 'basic',
                },
            },
        },
        security: [
            {
                basicAuth: [],
            },
        ],
    },
    apis: routes,
};
