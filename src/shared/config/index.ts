import { AppDataSource } from '../model';
import { Profile } from '../../core-profile/entities/Profile';
import { Chat } from '../../core-chat/entities/Chat';
import { Message } from '../../core-chat/entities/Message';

export const profileRepository = AppDataSource.getRepository(Profile);
export const chatsRepository = AppDataSource.getRepository(Chat);
export const messagesRepository = AppDataSource.getRepository(Message);

const routes = ['./**/routes/*.ts', './**/core-web/**/*.ts'];

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
                url: process.env.NODE_ENV == 'production' ? process.env.SERVER_HOST : process.env.LOCAL_HOST,
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
                basicAuth: {
                    type: 'http',
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
