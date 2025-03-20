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

const Authorization = async (req: Request, res: Response) => {
    const request_data: any = req.body;
    let { service_id, service_name } = request_data;

    if (
        service_id &&
        service_name &&
        typeof service_id === 'string' &&
        typeof service_name === 'string'
    ) {
        let new_service_name: string = service_name ? service_name : 'Unknown';
        const authRepository = AppDataSource.getRepository(Auth);
        const existing_auth = await authRepository.findOne({
            where: { service_name: service_name, service_user_id: service_id },
        });
        if (existing_auth)
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                message: 'User already exist!',
            });

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

            console.log('created newUser and newAuth');
            // Установка связи oneToMany в User
            newUser.resources = [newAuth];

            console.log('successfully added relationship');
            // Сохранение пользователя и его авторизацию в БД
            await userRepository.save(newUser);
            console.log('save user in DB');

            return res.status(HTTP_STATUSES.OK_200).json({
                user_id: user_id,
                access_token: access_token,
                refresh_token: refresh_token,
            });
        } catch (error) {
            return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                message:
                    'Error occured while creating user_id or JWT for session.',
                details: `${error}`,
            });
        }
    } else {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing Data or invalid type. Check your request data!',
        });
    }
};

export default { Authorization };
