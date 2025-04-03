import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { Profile } from '../entities/Profile';
import { HTTP_STATUSES } from '../../shared/utils';
import getUserId from '../../core-auth/utils/getUserId';

export const updateProfile = async (req: Request, res: Response) => {
    let user_id;
    try {
        user_id = getUserId(req);
    } catch (error) {
        if (error instanceof Error)
            return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                message: error.message,
            });
    }

    try {
        const update = await profileRepository
            .createQueryBuilder()
            .update(Profile)
            .set(req.body)
            .where('profile.user_id = :id', { id: user_id })
            .returning('*')
            .execute();
        if (update.affected === 1) {
            let updatedProfile = update.raw[0];
            const date = new Date(updatedProfile.birth_date);
            updatedProfile.birth_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            return res.status(200).send(updatedProfile);
        } else {
            return res.status(404).send('User not found');
        }
    } catch (error) {
        return res.status(500).send(`Failed to upload profile: ${error}`);
    }
};
