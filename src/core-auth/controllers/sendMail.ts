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
        } else return { success: false };
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
        html: `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Код подтверждения для Swans</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
        text-align: center;
        padding-bottom: 20px;
    }
    .header img {
        max-width: 100%;
        height: auto;
    }
    .content {
        text-align: center;
        padding: 20px 0;
    }
    .code {
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        margin: 20px 0;
        padding: 10px;
        background-color: #f9f9f9;
        border: 1px solid #dddddd;
        border-radius: 4px;
        display: inline-block;
    }
    .footer {
        text-align: center;
        padding-top: 20px;
        font-size: 12px;
        color: #777777;
    }
    .footer a {
        color: #007BFF;
        text-decoration: none;
    }
    .footer a:hover {
        text-decoration: underline;
    }

    /* Адаптивные стили */
    @media only screen and (max-width: 600px) {
        .container {
            padding: 15px;
        }
        .header h1 {
            font-size: 24px;
        }
        .content p {
            font-size: 16px;
        }
        .code {
            font-size: 20px;
            padding: 8px;
        }
        .footer {
            font-size: 10px;
        }
    }

    @media only screen and (max-width: 400px) {
        .header h1 {
            font-size: 20px;
        }
        .content p {
            font-size: 14px;
        }
        .code {
            font-size: 18px;
            padding: 6px;
        }
        .footer {
            font-size: 9px;
        }
    }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <img src="http://postimg.su/image/oTCRR3qh/SWANS.png" alt="Swans Logo" width="200">
        <h1>Подтверждение входа</h1>
    </div>
    <div class="content">
        <p>Здравствуйте!</p>
        <p>Для завершения аутентификации в приложении Swans, пожалуйста, используйте следующий код подтверждения:</p>
        <div class="code">${code}</div>
        <p>Если вы не запрашивали этот код, пожалуйста, проигнорируйте это письмо.</p>
    </div>
    <div class="footer">
        <p>С уважением, команда Swans</p>
        <p><a href="https://dating-swans.ru">Перейти на сайт</a></p>
        <p>Если у вас возникли вопросы, напишите нам на <a href="mailto:support@dating-swans.ru">support@dating-swans.ru</a></p>
    </div>
</div>
</body>
</html>`,
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
