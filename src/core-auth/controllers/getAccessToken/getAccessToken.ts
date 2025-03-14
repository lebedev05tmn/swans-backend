import { Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../shared/utils/index';
import { User } from '../../../core-user/models/entities/User';
import { AppDataSource } from '../../../shared/model';
import check_request_data from 'src/core-auth/utils/checkRequestData';
import existing_check from './utils/existingCheck';
import create_tokens from './utils/createTokens';

const getAccessTokenByServiceAuth = async (req: Request, res: Response) => {

    const request_data = req.body;
    let { service_user_id, service_name } = request_data;

    check_request_data(service_user_id, service_name, res);

    try {
        const existing_auth: any = existing_check(service_user_id, service_name, res);

        const tokens = create_tokens(existing_auth, res);
        let access_token, refresh_token;
        if (Array.isArray(tokens)) {
            [access_token, refresh_token] = tokens;
        }

        existing_auth.user.refresh_token = refresh_token;
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.save(existing_auth.user);
        return res.status(HTTP_STATUSES.OK_200).json({
            access_token: access_token,
            refresh_token: refresh_token,
        });
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while user authorization.',
            details: error,
        });
    }
};

export default { getAccessTokenByServiceAuth };
