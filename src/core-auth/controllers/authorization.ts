import { Request, Response } from 'express';
import bcrypt from 'bcrypt-nodejs';

import generateUniqueId from '../utils/generateUniqueId';
import { generateJWT, generateRefreshToken } from '../../shared/utils/generateJWT';
import { HTTP_STATUSES } from '../../shared/utils/index';
import { User } from '../../core-user/models/entities/User';
import { Auth } from '../models/entities/Auth';
import { AppDataSource } from '../../shared/model';
import { AuthServiceName } from '../../shared/utils/index';

const Authorization = async (req: Request, res: Response) => {
    const { service_id, service_name } = req.query;

    if (!service_id || !service_name || typeof service_id !== 'string' || typeof service_name !== 'string')
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing Data or invalid type. Check your request data!',
        });

    if (!Object.values(AuthServiceName).includes(service_name as AuthServiceName))
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing service name. Check your request data!',
        });

    const authRepository = AppDataSource.getRepository(Auth);
    const existing_auth = await authRepository.findOne({
        where: {
            service_name: service_name,
            service_user_id: service_id,
        },
    });

    if (existing_auth)
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'User already exist!',
        });
    try {
        const user_id: string = generateUniqueId(service_id, service_name);
        const access_token: string = generateJWT(user_id);
        const refresh_token: string = generateRefreshToken(user_id);

        const userRepository = AppDataSource.getRepository(User);

        const newUser = new User();
        newUser.user_id = user_id;
        newUser.refresh_token = refresh_token;

        const newAuth = new Auth();
        newAuth.service_user_id = bcrypt.hashSync(service_id, process.env.BCRYPT_SALT);
        console.log(newAuth.service_user_id);
        newAuth.service_name = service_name;

        newUser.resources = [newAuth];

        await userRepository.save(newUser);

        return res.status(HTTP_STATUSES.OK_200).json({
            user_id: user_id,
            access_token: access_token,
            refresh_token: refresh_token,
        });
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while creating user_id or JWT for session.',
            details: `${error}`,
        });
    }
};

export default { Authorization };
