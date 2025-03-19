import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../../core-user/models/entities/User';
import { AppDataSource } from '../../shared/model';
import { HTTP_STATUSES } from '../../shared/utils/index';
import jwtConfig from '../../shared/config/JWTConfig';

async function getUserAuthData(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                message: 'Missing or invalid Authorization header!',
            });
        }

        const token = authHeader.split(' ')[1];

        let decodedToken: any;
        try {
            decodedToken = jwt.verify(token, jwtConfig.secret);
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

        const userRepository = AppDataSource.getRepository(User);
        const currentUser = await userRepository.findOne({
            where: { user_id: user_id },
            relations: ['resources'],
        });

        if (currentUser) {
            return res.status(HTTP_STATUSES.OK_200).json({
                userId: user_id,
                resources: currentUser.resources.map((auth) => ({
                    authId: auth.auth_id,
                    serviceUserId: auth.service_user_id,
                    serviceName: auth.service_name,
                })),
            });
        } else {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: `User with id: ${user_id} dosen't exists!`,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Error occured while trying to fetch user auth data',
            details: error,
        });
    }
}

export default getUserAuthData;
