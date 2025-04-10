import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt-nodejs';

import { HTTP_STATUSES } from '../../shared/utils/index';
import { transporter } from '../../shared/config/NodeMailer';
import { AppDataSource } from '../../shared/model';
import { Auth } from '../models/entities/Auth';

export const forget_password = async (req: Request, res: Response) => {
    const { email }: { email: string } = req.body;

    const authRepository = AppDataSource.getRepository(Auth);
    const current_auth = await authRepository.findOne({
        where: { service_user_id: Like(`${email}:%`) },
    });

    if (!current_auth) {
        return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: `User with '${email}' email doesn't exists.`,
        });
    }

    try {
        const new_password = v4().slice(0, 11);
        const new_password_hash = bcrypt.hashSync(new_password, bcrypt.genSaltSync());

        const authRepository = AppDataSource.getRepository(Auth);
        current_auth.service_user_id = `${email}:${new_password_hash}`;
        await authRepository.save(current_auth);

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
};
