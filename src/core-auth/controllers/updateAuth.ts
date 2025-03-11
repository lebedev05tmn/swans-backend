import { Request, Response } from 'express';

import { HTTP_STATUSES } from '../../shared/utils/index';
import { User } from '../../core-user/models/entities/User';
import { Auth } from '../models/entities/Auth';
import { AppDataSource } from '../../shared/model';

const updateUserAuth = async (req: Request, res: Response) => {
    const request_data: any = req.body;
    let {
        user_id: current_user_id,
        service_user_id: service_id,
        service_name,
    } = request_data;
    if (
        !(
            current_user_id &&
            service_id &&
            service_name &&
            typeof service_id === 'string' &&
            typeof service_name === 'string'
        )
    ) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing Data or invalid type. Check your request data!',
        });
    }
    service_name = service_name ? service_name : 'Unknown';

    if (service_name === 'Unknown') {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Bad Service name!',
        });
    }

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

        const new_auth_data = new Auth();
        new_auth_data.service_user_id = service_id;
        new_auth_data.service_name = service_name;

        let is_auth_correct = true;
        current_user.resources.forEach((auth) => {
            if (auth.service_name == service_name) {
                is_auth_correct = false;
            }
        });

        if (!is_auth_correct) {
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                message: 'Trying to add same authType for the existing ones!',
            });
        }

        ('Check previous auth');
        current_user.resources.push(new_auth_data);

        await userRepository.save(current_user);

        return res.status(HTTP_STATUSES.OK_200).json({
            message: `Successfully added new Auth for user with '${current_user_id}' id.`,
        });
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while updating user auth.',
            details: error,
        });
    }
};

export default { updateUserAuth };
