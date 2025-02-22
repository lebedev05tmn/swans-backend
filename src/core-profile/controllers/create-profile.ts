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
            description: req.body.description,
            categories: req.body.categories,
            geolocation: req.body.geolocation,
            city: req.body.city,
        };
        const user_id = req.query.user_id as string;

        const existingUser = await profileRepository.findOneBy({
            user_id: user_id,
        });
        if (existingUser) {
            return res.status(400).send('User with this ID already exists');
        } else {
            const requiredParams = [
                user_id,
                newUser.user_name,
                newUser.birth_date,
                newUser.sex,
                newUser.images,
                newUser.geolocation,
                newUser.city,
            ];
            let correctParamsFlag = true;
            requiredParams.forEach((param) => {
                if (param === null || param === undefined) {
                    correctParamsFlag = false;
                    return res.status(400).send('Invalid input data');
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
                    description: newUser.description,
                    categories: newUser.categories,
                    geolocation: {
                        type: 'Point',
                        coordinates: [
                            newUser.geolocation[0],
                            newUser.geolocation[1],
                        ],
                    },
                    city: newUser.city,
                });

                await profileRepository.save(user);
                newUser.sex = await convertSex(newUser.sex);
                return res.status(201).json(newUser);
            }
        }
    } catch (error) {
        return res.status(500).send(`Failed to create user profile: ${error}`);
    }
};
