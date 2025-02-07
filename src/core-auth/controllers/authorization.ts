import { Request, Response } from 'express';

import generateUniqueId from '../utils/generateUniqueId';
import {
    generateJWT,
    generateRefreshToken,
} from '../../shared/utils/generateJWT';
import { HTTP_STATUSES } from '../../shared/utils/index';
import { User } from '../../core-user/models/entities/User';
import { Auth } from '../models/entities/Auth';
import { AppDataSource } from '../../shared/model';
import { AuthTypes } from '../../shared/utils/index';

const Authorization = async (req: Request, res: Response) => {
    /* Приходит id пользователя от стороннего ресурса + принадлежность к ресурсу в виде строки */

    const request_data: any = req.body;
    let { service_id, service_name } = request_data;

    if (
        service_id &&
        service_name &&
        typeof service_id === 'string' &&
        typeof service_name === 'string'
    ) {
        let new_service_name: string = '';

        switch (service_name) {
            case AuthTypes.APPLE:
                new_service_name = AuthTypes.APPLE;
                break;
            case AuthTypes.TELEGRAM:
                new_service_name = AuthTypes.TELEGRAM;
                break;
            case AuthTypes.VK:
                new_service_name = AuthTypes.VK;
                break;
            case AuthTypes.APP:
                new_service_name = AuthTypes.APP;
                break;
            default:
                new_service_name = 'Unknown';
        }
        if (new_service_name === 'Unknown') {
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                message: 'Bad Service name!',
            });
        }
        try {
            const user_id: string = generateUniqueId(service_id, service_name);
            const access_token: string = generateJWT(user_id);
            const refresh_token: string = generateRefreshToken(user_id);

            const userRepository = AppDataSource.getRepository(User);

            const newUser = new User();
            newUser.user_id = user_id;
            newUser.refresh_token = refresh_token;

            const newAuth = new Auth();
            newAuth.service_user_id = service_id;
            newAuth.service_name = service_name;

            // Установка связи oneToMany в User
            newUser.resources = [newAuth];

            // Сохранение пользователя и его авторизацию в БД
            await userRepository.save(newUser);
            console.log(
                `User with id: ${user_id} successfully added to the data base.`,
            );

            return res.status(HTTP_STATUSES.OK_200).json({
                userId: user_id,
                accessToken: access_token,
                refreshToken: refresh_token,
            });
        } catch (error) {
            return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                message:
                    'Error occured while creating user_id or JWT for session.',
                details: error,
            });
        }
    } else {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing Data or invalid type. Check your request data!',
        });
    }
};

export default { Authorization };
