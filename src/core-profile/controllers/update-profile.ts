import { Request, Response } from 'express';
import { chatsRepository, profileRepository } from '../../shared/config';
import { Profile } from '../entities/Profile';
import { emitChatMetadata, HTTP_STATUSES } from '../../shared/utils';
import { decodeUserId } from '../../core-auth/utils/getUserId';

export const updateProfile = async (req: Request, res: Response) => {
    const user_id = await decodeUserId(req.headers.authorization);

    try {
        const profileBefore = await profileRepository.findOneByOrFail({ user: { user_id: user_id } });
        const pictureBefore = profileBefore.images[0];

        const update = await profileRepository
            .createQueryBuilder()
            .update(Profile)
            .set(req.body)
            .where('profile.user_id = :id', { id: user_id })
            .returning('*')
            .execute();

        if (update.affected === 1) {
            let updatedProfile = update.raw[0];
            const date = new Date(updatedProfile.birth_date);
            updatedProfile.birth_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

            let pictureAfter = null;
            if (updatedProfile.images && updatedProfile.images.length > 0) {
                pictureAfter = updatedProfile.images[0];
            }

            if (pictureBefore !== pictureAfter) {
                const chats = await chatsRepository
                    .createQueryBuilder('chat')
                    .select(['chat.chat_id'])
                    .where('chat.user1_id = :userId OR chat.user2_id = :userId', { userId: user_id })
                    .getMany();

                if (chats.length > 0) {
                    await Promise.all(chats.map(async (chat) => await emitChatMetadata(user_id, chat.chat_id)));
                }
            }

            return res.status(HTTP_STATUSES.OK_200).send(updatedProfile);
        } else {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).send('User not found');
        }
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).send(`Failed to upload profile: ${error}`);
    }
};
