import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt-nodejs';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { HTTP_STATUSES } from '../../shared/utils/index';
import { transporter } from '../../shared/config/NodeMailer';
import { AppDataSource } from '../../shared/model';
import { Auth } from '../models/entities/Auth';
import { User } from '../../core-user/models/entities/User';
import jwtConfig from '../../shared/config/JWTConfig';

export const forget_password = async (req: Request, res: Response) => {
    const { email } = req.body;
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

    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOne({
        where: { user_id: user_id },
        relations: ['resources'],
    });

    if (!currentUser)
        return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: `User doesn't exists.`,
        });

    if (email) {
        try {
            const authRepository = AppDataSource.getRepository(Auth);

            const current_auth = await authRepository.findOne({
                where: { service_user_id: Like(`${email}:%`) },
            });

            const new_password = v4();
            const new_password_hash = bcrypt.hashSync(new_password, bcrypt.genSaltSync());

            if (current_auth) {
                const authRepository = AppDataSource.getRepository(Auth);
                current_auth.service_user_id = `${email}:${new_password_hash}`;
                await authRepository.save(current_auth);
            } else {
                return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                    message: `User with '${email}' email doesn't exists.`,
                });
            }

            const mailOptions = {
                from: process.env.WORK_EMAIL,
                to: email,
                subject: 'Swans. Получение забытого пароля',
                text: `Ваш новый пароль '${new_password}'`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                        message: `Error occured while sendind mail to '${email}'`,
                        details: error,
                    });
                } else {
                    return res.status(HTTP_STATUSES.OK_200).json({
                        message: info,
                    });
                }
            });
        } catch (error) {
            return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                message: 'Error occured while founding the auth field',
                details: error,
            });
        }
    } else {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Bad email data!',
        });
    }
};
