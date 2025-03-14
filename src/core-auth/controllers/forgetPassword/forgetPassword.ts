import { Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../shared/utils/index';
import send_new_password from './utils/sendNewPassword';
import save_new_password from './utils/saveNewPassword';

export const forget_password = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Bad email data!',
        });
    }

    try {
        const save_info = [email, res] as const;
        const new_password = await save_new_password(save_info);

        const mail_info = [email, new_password, res] as const;
        send_new_password(mail_info);

    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while founding the auth field',
            details: error,
        });
    }
};
