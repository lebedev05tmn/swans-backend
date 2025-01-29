import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { Profile } from '../entities/Profile';
import { convertSex } from '../utils';
import { HTTP_STATUSES } from '../../shared/utils';

export const getAllProfiles = async (req: Request, res: Response) => {
    try {
        const users: Profile[] = (await profileRepository.find()) as Profile[];
        let usersTypisated: any = { list: [], length: 0 };
        await Promise.all(
            users.map(async (user) => {
                const updatedUser: any = { ...user };
                if (typeof user.sex === 'boolean') {
                    updatedUser.sex = await convertSex(user.sex);
                }
                updatedUser.geolocation = updatedUser.geolocation.coordinates;
                usersTypisated.list.push(updatedUser);
            }),
        );
        usersTypisated.length = usersTypisated.list.length;
        return res.status(HTTP_STATUSES.OK_200).json(usersTypisated);
    } catch (error) {
        return res.status(500).send(`Unable to load users: ${error}`);
    }
};
