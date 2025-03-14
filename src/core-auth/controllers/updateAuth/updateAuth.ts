import { Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../shared/utils/index';
import { User } from '../../../core-user/models/entities/User';
import { AppDataSource } from '../../../shared/model';
import check_request_data from './utils/checkRequestData';
import add_new_auth from './utils/addNewAuth';

const updateUserAuth = async (req: Request, res: Response) => {
    let service_id, service_name, current_user_id;
    [service_id, service_name, current_user_id] = check_request_data(req, res);

    try {
        const userRepository = AppDataSource.getRepository(User);

        const current_user = await userRepository.findOne({
            where: { user_id: current_user_id },
            relations: ['resources'],
        });

        if (!current_user) {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: `User with ${current_user_id} id doesn't exists.`,
            });
        }

        add_new_auth(service_id, service_name, current_user, userRepository, res);

    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while updating user auth.',
            details: error,
        });
    }
};

export default { updateUserAuth };
