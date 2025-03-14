import { Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../shared/utils';
import get_user_id from './utils/getUserId';
import send_new_tokens from './utils/sendNewTokens';

async function refreshAccessToken(req: Request, res: Response) {
    try {
        const user_id = get_user_id(req, res);

        send_new_tokens(user_id, res);
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while refreshing token.',
            details: error,
        });
    }
}

export default refreshAccessToken;
