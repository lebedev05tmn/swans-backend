import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { convertSex } from '../utils';
import { Profile } from '../entities/Profile';
import { HTTP_STATUSES } from '../../shared/utils';

export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (req.body.sex) req.body.sex = await convertSex(req.body.sex);

        const user_id = Number(req.query.id);
        const update = await profileRepository
            .createQueryBuilder()
            .update(Profile)
            .set(req.body)
            .where('user_id = :id', { id: user_id })
            .returning('*')
            .execute();

        if (update.affected === 1) {
            let updatedUser = update.raw[0];
            const date = new Date(updatedUser.birth_date);
            updatedUser.birth_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

            return res.status(HTTP_STATUSES.OK_200).send(updatedUser);
        } else {
            return res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .send('User not found');
        }
    } catch (error) {
        return res.status(500).send(`Failed to upload profile: ${error}`);
    }
};
