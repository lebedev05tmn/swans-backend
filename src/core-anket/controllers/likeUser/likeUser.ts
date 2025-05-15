import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../../../shared/utils';
import getUserId from '../../../core-auth/utils/getUserId';
import { AppDataSource } from '../../../shared/model';
import { User } from '../../../core-user/models/entities/User';

export const like_user = async (req: Request, res: Response) => {
    const { liked_user_id, is_super_like }: { liked_user_id: string; is_super_like: boolean } = req.body;
    if (!liked_user_id || is_super_like == undefined) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: `Request must contain some values!`,
        });
    }

    const current_user_id = getUserId(req, res);
    if (current_user_id instanceof Object) {
        return current_user_id;
    }

    try {
        const user_repository = AppDataSource.getRepository(User);
        const current_user = await user_repository.findOne({
            where: { user_id: current_user_id },
        });
        const liked_user = await user_repository.findOne({
            where: { user_id: liked_user_id },
        });

        if (!current_user || !liked_user) {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: `User or users aren't exist`,
            });
        }

        if (current_user.likes_list.find((liked) => liked.user_id === liked_user_id)) {
            console.log('Mututal likes');
        } else {
            liked_user.likes_list.push({ user_id: current_user_id, is_super_like });
            await user_repository.save(liked_user);
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
