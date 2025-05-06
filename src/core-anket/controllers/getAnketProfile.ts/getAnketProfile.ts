import { Request, Response } from 'express';
import getUserId from '../../../core-auth/utils/getUserId';
import { AppDataSource } from '../../../shared/model';
import { User } from 'src/core-user/models/entities/User';
import { HTTP_STATUSES } from 'src/shared/utils';
import { make_response } from './utils/makeResponse';

export const get_anket_profile = async (req: Request, res: Response) => {
    const res_or_user_id = getUserId(req, res);
    if (res_or_user_id instanceof Object) return res_or_user_id;

    const current_user = await AppDataSource.getRepository(User).findOne({
        where: { user_id: res_or_user_id },
        relations: ['profile'],
    });
    const search_user = await AppDataSource.getRepository(User).findOne({
        where: { user_id: req.body.user_id },
        relations: ['profile'],
    });

    if (!current_user || !search_user) {
        return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: `Current user or anket user don't exist!`,
        });
    }
    return make_response(current_user, search_user, res);
};
