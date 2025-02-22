import { Request, Response } from 'express';
import { profileRepository } from '../../shared/config';
import { HTTP_STATUSES } from '../../shared/utils';

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const user_id = req.params.id;
        const user = await profileRepository.findOneBy({
            user_id: user_id,
        });

        if (user) {
            await profileRepository.delete(user_id);
            return res.sendStatus(204);
        } else {
            return res.status(404).send('User not found');
        }
    } catch (error) {
        return res.status(500).send(`Failed to delete profile: ${error}`);
    }
};
