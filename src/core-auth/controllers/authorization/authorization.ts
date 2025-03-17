import { Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../shared/utils/index';
import { get_user_id_and_tokens } from '../../utils/getUserIdAndTokens';
import create_user from '../../utils/createUser';
import check_request_data from '../../../core-auth/utils/checkRequestData';

const Authorization = async (req: Request, res: Response) => {
    const request_data: any = req.body;
    let { service_id, service_name } = request_data;

    check_request_data(service_id, service_name, res);

    let new_service_name: string = service_name ? service_name : 'Unknown';

    if (new_service_name === 'Unknown') {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Bad Service name!',
        });
    }
    try {
        const [user_id, access_token, refresh_token] = get_user_id_and_tokens(
            service_id,
            service_name,
        );

        const auth_info = [user_id, refresh_token, service_id, service_name] as const;

        await create_user(auth_info);

        return res.status(HTTP_STATUSES.OK_200).json({
            user_id: user_id,
            access_token: access_token,
            refresh_token: refresh_token,
        });
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while creating user_id or JWT for session.',
            details: error,
        });
    }
};

export default { Authorization };
