import { Request, Response } from 'express';

import { generateJWT, generateRefreshToken } from '../../../shared/utils/generateJWT';
import { HTTP_STATUSES } from '../../../shared/utils/index';
import { Auth } from '../../models/entities/Auth';
import { User } from '../../../core-user/models/entities/User';
import { AppDataSource } from '../../../shared/model';
import { find_auth } from './utils/findAuth';

const getAccessTokenByServiceAuth = async (req: Request, res: Response) => {
    /* Получение аксесс и рефреш токена при повторной регистрации через сторонние сервисы */
    const request_data = req.body;
    let { service_user_id, service_name } = request_data;

    if (!(service_user_id && service_name && typeof service_user_id == 'string' && typeof service_name == 'string')) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing Data or invalid type. Check your request data!',
        });
    }

    try {
        const existing_auth = await find_auth(service_user_id, service_name);
        if (existing_auth instanceof Auth && existing_auth) {
            const current_user_id = existing_auth.user.user_id;
            if (current_user_id) {
                const access_token = generateJWT(current_user_id);
                const refresh_token = generateRefreshToken(current_user_id);

                if (access_token && refresh_token) {
                    existing_auth.user.refresh_token = refresh_token;
                    const userRepository = AppDataSource.getRepository(User);
                    await userRepository.save(existing_auth.user);
                    return res.status(HTTP_STATUSES.OK_200).json({
                        access_token: access_token,
                        refresh_token: refresh_token,
                    });
                } else {
                    return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                        message: 'Error occured while creating tokens.',
                        details: 'Access or refresh token have not generated.',
                    });
                }
            } else {
                return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                    message: 'Error occured while fetching user_data by auth.',
                    details: 'Error with auth relationship to user data',
                });
            }
        } else {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: `User with '${service_name}' service name and '${service_user_id}' service_user_id doesn't exists.`,
            });
        }
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while user authorization.',
            details: error,
        });
    }
};

export default { getAccessTokenByServiceAuth };
