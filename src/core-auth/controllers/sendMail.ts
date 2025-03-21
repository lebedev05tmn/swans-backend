import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt-nodejs';

import { transporter } from '../../shared/config/NodeMailer';
import { AppDataSource } from '../../shared/model';
import { Auth } from '../models/entities/Auth';
import { User } from '../../core-user/models/entities/User';
import {
    generateJWT,
    generateRefreshToken,
} from '../../shared/utils/generateJWT';
import generateUniqueId from '../utils/generateUniqueId';
import { AuthTypes } from '../../shared/utils/index';

const session_container = new Map();

export const send_code = async (params: any) => {
    const { email } = params;
    const code: string = Math.floor(Math.random() * 90000 + 10000).toString();
    const session_id: string = uuid();

    for (let [session_id, session] of session_container) {
        if (session.email === email) {
            session_container.delete(session_id);
            break;
        }
    }

    session_container.set(session_id, {
        email,
        code,
        state: 'code',
    });

    setTimeout(
        () => {
            session_container.delete(session_id);
        },
        5 * 60 * 1000,
    );

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
    transporter.verify((error, success) => {
        if (error) {
            console.error('Error verifying transporter:', error);
        } else {
            console.log('Transporter is ready to send emails', success);
        }
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            throw new Error('Send mail Error!');
        } else {
            console.log('Email sent:', info.response);
        }
    });

    return { success: true, session_id: session_id };
};

export const verify_code = async (params: any) => {
    const { session_id, code } = params;
    const session = session_container.get(session_id);

    if (!session || session.state !== 'code')
        throw new Error("Session doesn't exists or in invalid state!");
    if (session.code !== code) throw new Error('Wrong code!');

    session.state = 'password';

    return {
        success: true,
        message: 'Code has been successfully verificated!',
    };
};

export const create_user = async (params: any) => {
    const { session_id, email, password } = params;
    const session = session_container.get(session_id);
    const password_hash = bcrypt.hashSync(password, bcrypt.genSaltSync());

    if (!session || session.state !== 'password')
        throw new Error("Session doesn't exists or has invalid state!");

    // Алгоритм для создания нового пользователя, повторяем все то, что использовали в authentification
    // + используем любой способ шифрования для хранения паролей в БД

    try {
        const service_name: string = AuthTypes.APP;
        const service_id: string = [email, password_hash].join(':');

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

        session_container.delete(session_id);
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
