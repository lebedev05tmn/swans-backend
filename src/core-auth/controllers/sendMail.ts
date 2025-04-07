import bcrypt from 'bcrypt-nodejs';
import { Like } from 'typeorm';
import { Options } from 'nodemailer/lib/mailer';

import { transporter } from '../../shared/config/NodeMailer';
import { AppDataSource } from '../../shared/model';
import { Auth } from '../models/entities/Auth';
import { User } from '../../core-user/models/entities/User';
import { generateJWT, generateRefreshToken } from '../../shared/utils/generateJWT';
import generateUniqueId from '../utils/generateUniqueId';
import { AuthServiceName } from '../../shared/utils/index';
import { redisClient } from '../../app';
import { email_with_code } from '../../shared/config/emailWithCode';

type Session = {
    code: string;
    state: string;
    start_time: string;
};

const set_hash_map = async (key: string, data: Session) => {
    console.log('Entering Set Hash Map');
    await redisClient.hSet(key, {
        code: data.code,
        state: data.state,
        start_time: data.start_time,
    });
    await redisClient.expire(key, 300);
};

// const session_container: Map<string, Session> = new Map();

interface SendCodeParams {
    email: string;
}

export const send_code = async (params: SendCodeParams) => {
    const { email } = params;
    const code: string = Math.floor(Math.random() * 90000 + 10000).toString();
    const current_date: string = new Date().toISOString();

    const authRepository = AppDataSource.getRepository(Auth);

    const existnig_auth = await authRepository.findOne({
        where: { service_user_id: Like(`${email}:%`) },
    });

    if (existnig_auth)
        return {
            success: false,
            message: 'User with this email alredy exist!',
        };

    const session: Record<string, string> = await redisClient.hGetAll(email);
    if (session.start_time) {
        if ((Date.parse(current_date) - Date.parse(session.start_time)) / 1000 > 60) {
            await redisClient.del(email);
            console.log('Delete current session');
        } else return { success: false, message: 'The session for this email has been created less than a minute ago' };
    }

    set_hash_map(email, {
        code,
        state: 'code',
        start_time: new Date().toISOString(),
    });

    const mailOptions = {
        from: process.env.WORK_EMAIL,
        to: email,
        subject: 'Swans. Подтверждение регистрации',
        html: email_with_code(code),
    };

    const sendEmail = async (mailOptions: Options) => {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            return { success: true };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false };
        }
    };

    const result = await sendEmail(mailOptions);
    return result;
};

interface VerifyCodeParams {
    email: string;
    code: string;
}

export const verify_code = async (params: VerifyCodeParams) => {
    const { email, code } = params;
    const session: Record<string, string> = await redisClient.hGetAll(email);

    if (!session || session.state !== 'code') throw new Error("Session doesn't exists or in invalid state!");
    if (session.code !== code) throw new Error('Wrong code!');

    await redisClient.hSet(email, 'state', 'password');

    return {
        success: true,
        message: 'Code has been successfully verificated!',
    };
};

interface CreateUserParams {
    email: string;
    password: string;
}

export const create_user = async (params: CreateUserParams) => {
    const { email, password } = params;
    const session: Record<string, string> = await redisClient.hGetAll(email);
    const password_hash = bcrypt.hashSync(password, bcrypt.genSaltSync());

    if (!session || session.state !== 'password') throw new Error("Session doesn't exists or has invalid state!");

    // Алгоритм для создания нового пользователя, повторяем все то, что использовали в authentification
    // + используем любой способ шифрования для хранения паролей в БД

    try {
        const service_name: string = AuthServiceName.APP;
        const service_id: string = `${email}:${password_hash}`;
        const user_id: string = generateUniqueId(service_id, service_name);
        const access_token: string = generateJWT(user_id);
        const refresh_token: string = generateRefreshToken(user_id);

        const userRepository = AppDataSource.getRepository(User);

        const newUser = new User();
        newUser.user_id = user_id;
        newUser.refresh_token = refresh_token;

        const newAuth = new Auth();
        newAuth.service_name = service_name;
        newAuth.service_user_id = service_id;

        newUser.resources = [newAuth];

        // Сохранение пользователя и его авторизацию в БД
        await userRepository.save(newUser);

        await redisClient.del(email);

        // Также в return должен пойти access и refresh токены для последующей работы
        return {
            success: true,
            access_token: access_token,
            refresh_token: refresh_token,
        };
    } catch (error) {
        throw new Error(`${error}`);
    }
};
