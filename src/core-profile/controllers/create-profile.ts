import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { HTTP_STATUSES } from '../../shared/utils';
import { convertSex } from '../utils';
import { Profile } from '../entities/Profile';

export const createProfile = async (req: Request, res: Response) => {
    try {
        const newUser = {
            user_name: req.body.user_name,
            birth_date: req.body.birth_date,
            sex: req.body.sex,
            images: req.body.images,
            short_desc: req.body.short_desc,
            long_desc: req.body.long_desc,
            categories: req.body.categories,
            geolocation: req.body.geolocation,
        };
        const user_id = Number(req.query.user_id);

        const existingUser = await profileRepository.findOneBy({
            user_id: user_id,
        });
        if (existingUser) {
            return res
                .status(HTTP_STATUSES.BAD_REQUEST_400)
                .send('User with this ID already exists');
        } else {
            const requiredParams = [
                user_id,
                newUser.user_name,
                newUser.birth_date,
                newUser.sex,
                newUser.images,
                newUser.geolocation,
            ];
            let correctParamsFlag = true;
            requiredParams.forEach((param) => {
                if (param === null || param === undefined) {
                    correctParamsFlag = false;
                    return res
                        .status(HTTP_STATUSES.BAD_REQUEST_400)
                        .send('Invalid input data');
                }
            });

            if (correctParamsFlag) {
                newUser.sex = await convertSex(newUser.sex);

                const user = Profile.create({
                    user_id: user_id,
                    user_name: newUser.user_name,
                    birth_date: newUser.birth_date,
                    sex: newUser.sex,
                    images: newUser.images,
                    short_desc: newUser.short_desc,
                    long_desc: newUser.long_desc,
                    categories: newUser.categories,
                    geolocation: {
                        type: 'Point',
                        coordinates: [
                            newUser.geolocation[0],
                            newUser.geolocation[1],
                        ],
                    },
                });

                await profileRepository.save(user);
                newUser.sex = await convertSex(newUser.sex);
                return res.status(HTTP_STATUSES.CREATED_201).json(newUser);
            }
        }
    } catch (error) {
        return res.status(500).send(`Failed to create user profile: ${error}`);
    }
};
