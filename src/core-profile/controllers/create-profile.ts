import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { HTTP_STATUSES } from '../../shared/utils';
import { convertSex } from '../utils';
import { Profile } from '../entities/Profile';

export const createProfile = async (req: Request, res: Response) => {
    try {
        let {
            user_name,
            birth_date,
            sex,
            images,
            short_desc,
            long_desc,
            categories,
        } = req.body;
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
                user_name,
                birth_date,
                sex,
                images,
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
                sex = await convertSex(sex);

                const user = Profile.create({
                    user_id: user_id,
                    user_name: user_name,
                    birth_date: birth_date,
                    sex: sex,
                    images: images,
                    short_desc: short_desc,
                    long_desc: long_desc,
                    categories: categories,
                });

                await profileRepository.save(user);
                return res.status(HTTP_STATUSES.CREATED_201).json(user);
            }
        }
    } catch (error) {
        return res.status(500).send(`Failed to create user profile: ${error}`);
    }
};
