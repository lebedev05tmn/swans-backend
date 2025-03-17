import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { convertSex } from '../utils';
import { Profile } from '../entities/Profile';
import { HTTP_STATUSES } from '../../shared/utils';

export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (req.body.sex) req.body.sex = await convertSex(req.body.sex);
        if (req.body.geolocation)
            req.body.geolocation = {
                type: 'Point',
                coordinates: req.body.geolocation,
            };

        const update = await profileRepository
            .createQueryBuilder()
            .update(Profile)
            .set(req.body)
            .where('user_id = :id', { id: req.query.id })
            .returning('*')
            .execute();

        if (update.affected === 1) {
            let updatedProfile = update.raw[0];
            const date = new Date(updatedProfile.birth_date);
            updatedProfile.birth_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            updatedProfile.sex = await convertSex(updatedProfile.sex);

            let geo = await profileRepository
                .createQueryBuilder()
                .select('ST_AsGeoJSON(geolocation)', 'geolocation')
                .where('user_id = :id', { id: req.query.id })
                .getRawOne();

            geo = JSON.parse(geo.geolocation);
            updatedProfile.geolocation = geo.coordinates;

            return res.status(200).send(updatedProfile);
        } else {
            return res.status(404).send('User not found');
        }
    } catch (error) {
        return res.status(500).send(`Failed to upload profile: ${error}`);
    }
};
