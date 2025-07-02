import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { Profile } from '../entities/Profile';

type TUsersTypistated = { list: Profile[]; length: number };

export const getAllProfiles = async (req: Request, res: Response) => {
    try {
        const users: Profile[] = (await profileRepository.find()) as Profile[];
        let usersTypisated: TUsersTypistated = { list: [], length: 0 };
        await Promise.all(
            users.map(async (user) => {
                usersTypisated.list.push(user);
            }),
        );
        usersTypisated.length = usersTypisated.list.length;
        return res.status(200).json(usersTypisated);
    } catch (error) {
        return res.status(500).send(`Unable to load users: ${error}`);
    }
};
