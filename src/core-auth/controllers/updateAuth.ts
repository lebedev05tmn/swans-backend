import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { HTTP_STATUSES } from '../../shared/utils/index';
import { User } from '../../core-user/models/entities/User';
import { Auth } from '../models/entities/Auth';
import { AppDataSource } from '../../shared/model';
import jwtConfig from '../../shared/config/JWTConfig';

const updateUserAuth = async (req: Request, res: Response) => {
    const request_data: Record<string, string> = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Missing or invalid Authorization header!',
        });
    }

    const token = authHeader.split(' ')[1];

    let decodedToken: JwtPayload;
    try {
        decodedToken = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch (error) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Invalid or expired token!',
        });
    }

    const user_id = decodedToken.userId;
    if (!user_id) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Invalid token payload!',
        });
    }
    let { service_user_id: service_id, service_name } = request_data;
    if (
        service_id &&
        service_name &&
        typeof service_id === 'string' &&
        typeof service_name === 'string'
    ) {
        service_name = service_name ? service_name : 'Unknown';

        if (service_name === 'Unknown') {
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                message: 'Bad Service name!',
            });
        }
        try {
            const userRepository = AppDataSource.getRepository(User);

            const current_user = await userRepository.findOne({
                where: { user_id: user_id },
                relations: ['resources'],
            });

            if (current_user) {
                const new_auth_data = new Auth();
                new_auth_data.service_user_id = service_id;
                new_auth_data.service_name = service_name;

                let is_auth_correct = true;
                current_user.resources.forEach((auth) => {
                    if (auth.service_name == service_name) {
                        is_auth_correct = false;
                    }
                });
                if (is_auth_correct) {
                    current_user.resources.push(new_auth_data);

                    await userRepository.save(current_user);

                    return res.status(HTTP_STATUSES.OK_200).json({
                        message: `Successfully added new Auth for user with '${user_id}' id.`,
                    });
                } else {
                    return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                        message:
                            'Trying to add same authType for the existing ones!',
                    });
                }
            } else {
                return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                    message: `User with ${user_id} id doesn't exists.`,
                });
            }
        } catch (error) {
            return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                message: 'Error occured while updating user auth.',
                details: error,
            });
        }
    } else {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing Data or invalid type. Check your request data!',
        });
    }
};

export default { updateUserAuth };
