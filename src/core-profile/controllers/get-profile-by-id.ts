import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../../shared/utils';
import { profileRepository } from '../../shared/config';
import { convertSex } from '../utils';

export const getProfileById = async (req: Request, res: Response) => {
    try {
        if (req.params.id === null || req.params.id === undefined) {
            return res.status(400).send('Incorrect ID');
        }

        let user = (await profileRepository.findOneBy({
            user_id: Number(req.params.id),
        })) as any;

        if (user) {
            user.sex = await convertSex(user.sex);
            user.geolocation = user.geolocation.coordinates;
            return res.json(user);
        } else {
            return res.status(404).send('User not found');
        }
    } catch (error) {
        return res.status(500).send(`Failed to load user: ${error}`);
    }
};
