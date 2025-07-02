import { Request, Response } from 'express';

import getUserId from '../../../core-auth/utils/getUserId';
import { User } from '../../../core-user/models/entities/User';
import { AppDataSource } from '../../../shared/model';
import { HTTP_STATUSES } from '../../../shared/utils';

export const get_likes_list = async (req: Request, res: Response) => {
    const current_user_id = getUserId(req, res);
    if (current_user_id instanceof Object) return current_user_id;

    try {
        const current_user = await AppDataSource.getRepository(User).findOne({
            where: { user_id: current_user_id },
        });
        if (!current_user) {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: `User with ${current_user_id} doesn't exist`,
            });
        }

        const super_likes: number = current_user.likes_list.filter((liked) => liked.is_super_like).length;

        return res.status(HTTP_STATUSES.OK_200).json({
            likes_list: current_user.likes_list,
            super_likes,
        });
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: `Error occured while fetching likes_list`,
            details: error,
        });
    }
};
