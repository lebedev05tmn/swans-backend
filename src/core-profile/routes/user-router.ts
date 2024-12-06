import express from 'express';
import { HTTP_STATUSES } from '../../shared/utils';
import { Profile } from '../entities/Profile';
import { userRepository } from '../../app';
import { getSexBoolean, getSexString } from '../utils';

export const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
    try {
        const users: Profile[] = (await userRepository.find()) as Profile[];
        const updatedUsers = await Promise.all(
            users.map(async (user) => {
                const updatedUser: any = { ...user };
                if (typeof user.sex === 'boolean') {
                    updatedUser.sex = await getSexString(user.sex);
                }
                return updatedUser;
            }),
        );
        res.json(updatedUsers);
    } catch (error) {
        res.status(500).send(`Unable to load users: ${error}`);
    }
});

userRouter.get('/:id', async (req, res) => {
    try {
        if (req.params.id === null || req.params.id === undefined) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send('Incorrect ID');
        }

        let user = (await userRepository.findOneBy({
            user_id: Number(req.params.id),
        })) as any;

        if (user) {
            user.sex = await getSexString(user.sex);
            res.json(user);
        } else {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(`Failed to load user: ${error}`);
    }
});

userRouter.post('/', async (req, res) => {
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

        const existingUser = await userRepository.findOneBy({
            user_id: user_id,
        });
        if (existingUser) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send(
                'User with this ID already exists',
            );
        } else {
            const requiredParams = [
                user_id,
                user_name,
                birth_date,
                sex,
                images,
            ];
            let paramsAreCorrect = true;
            requiredParams.forEach((param) => {
                if (param === null || param === undefined) {
                    paramsAreCorrect = false;
                    res.status(HTTP_STATUSES.BAD_REQUEST_400).send(
                        'Invalid input data',
                    );
                }
            });

            if (paramsAreCorrect) {
                sex = await getSexBoolean(sex);

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

                await userRepository.save(user);
                res.status(HTTP_STATUSES.CREATED_201).json(user);
            }
        }
    } catch (error) {
        res.status(500).send(`Failed to create user profile: ${error}`);
    }
});

userRouter.patch('/', async (req, res) => {
    try {
        if (req.body.sex) req.body.sex = await getSexBoolean(req.body.sex);

        const user_id = Number(req.query.id);
        const update = await userRepository
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

            res.status(HTTP_STATUSES.OK_200).send(updatedUser);
        } else {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(`Failed to upload profile: ${error}`);
    }
});

userRouter.delete('/:id', async (req, res) => {
    try {
        const user_id = Number(req.params.id);
        const user = await userRepository.findOneBy({
            user_id: user_id,
        });

        if (user) {
            await userRepository.delete(user_id);
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.status(HTTP_STATUSES.NOT_FOUND_404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(`Failed to delete profile: ${error}`);
    }
});
