import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt-nodejs';

import { transporter } from '../../../shared/config/NodeMailer';
import { AuthTypes } from '../../../shared/utils/index';
import { get_user_id_and_tokens } from '../../utils/getUserIdAndTokens';
import { mail_to_send } from '../../utils/htmlMailToSend';

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
        html: mail_to_send(code),
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw new Error('Send mail Error!');
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
    const salt = bcrypt.genSaltSync();
    const password_hash = bcrypt.hashSync(password, salt);

    if (!session || session.state !== 'password')
        throw new Error("Session doesn't exists or has invalid state!");

    try {
        const service_name: string = AuthTypes.APP;
        const service_id: string = [email, password_hash].join(':');

        const [user_id, access_token, refresh_token] = get_user_id_and_tokens(
            service_id,
            service_name,
        );

        const auth_info = [user_id, refresh_token, service_id, service_name] as const;

        await create_user(auth_info);

        session_container.delete(session_id);

        return {
            success: true,
            access_token: access_token,
            refresh_token: refresh_token,
        };
    } catch (error) {
        throw new Error(`${error}`);
    }
};
