import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../../shared/utils';
import { profileRepository } from '../../shared/config';
import getUserId from '../../core-auth/utils/getUserId';

export const getProfileById = async (req: Request, res: Response) => {
    let user_id;
    try {
        user_id = getUserId(req, res);
    } catch (error) {
        if (error instanceof Error)
            return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                message: error.message,
            });
    }

    try {
        const profile = await profileRepository.findOne({
            where: { user: { user_id: user_id } },
            relations: ['user'],
        });
        if (profile) {
            return res.json(profile);
        } else {
            return res.status(404).send('profile not found');
        }
    } catch (error) {
        return res.status(500).send(`Failed to load profile: ${error}`);
    }
};
