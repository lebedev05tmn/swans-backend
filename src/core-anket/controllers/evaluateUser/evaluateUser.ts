import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../../../shared/utils';
import getUserId from '../../../core-auth/utils/getUserId';
import { AppDataSource } from '../../../shared/model';
import { User } from '../../../core-user/models/entities/User';

export const evaluate_user = async (req: Request, res: Response) => {
    const {
        evaluated_user_id,
        like,
        is_super_like,
    }: { evaluated_user_id: string; like: boolean; is_super_like: boolean } = req.body;
    if (!evaluated_user_id || is_super_like == undefined || like == undefined) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: `Request must contain all the values!`,
        });
    }

    const current_user_id = getUserId(req, res);
    if (current_user_id instanceof Object) {
        return current_user_id;
    }

    try {
        const user_repository = AppDataSource.getRepository(User);
        const current_user = await user_repository.findOneOrFail({
            where: { user_id: current_user_id },
        });
        const evaulated_user = await user_repository.findOneOrFail({
            where: { user_id: evaluated_user_id },
        });

        if (!like) {
            current_user.viewed_ankets_ids.push(evaluated_user_id);
            await user_repository.save(current_user);
            return res.status(HTTP_STATUSES.OK_200).json({
                message: `Successfully added evaluate_user to the viewed users list`,
            });
        }

        if (current_user.likes_list.find((liked) => liked.user_id === evaluated_user_id)) {
            console.log('Mututal likes');
        } else {
            evaulated_user.likes_list.push({ user_id: current_user_id, is_super_like });
            current_user.viewed_ankets_ids.push(evaluated_user_id);
            await user_repository.save(evaulated_user);
            await user_repository.save(current_user);

            return res.status(HTTP_STATUSES.OK_200).json({
                message: `Successfully added new user_id into likes_list`,
            });
        }
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: `Error occured while working with DB`,
            details: error,
        });
    }
};
