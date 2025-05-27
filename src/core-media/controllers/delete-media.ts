import { Request, Response } from 'express';
import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { s3Сlient } from '../s3_client';
import { chatsRepository, profileRepository } from '../../shared/config';
import { decodeUserId } from '../../core-auth/utils/getUserId';
import { emitChatMetadata } from '../../shared/utils';

export const deleteMedia = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const userId = decodeUserId(req.headers.authorization);

        let profile = await profileRepository.findOneByOrFail({ user: { user_id: userId } });
        const currentProfilePicture = profile.images[0];

        let command = new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${id}.webp`,
        });

        await s3Сlient.send(command);

        command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${id}.webp`,
        });

        await s3Сlient.send(command);

        profile = await profileRepository.findOneByOrFail({ user: { user_id: userId } });

        const newProfilePicture = profile.images[0];

        if (currentProfilePicture !== newProfilePicture) {
            const chatIds = await chatsRepository
                .createQueryBuilder('chat')
                .select(['chat.chat_id'])
                .where('chat.user1_id = :userId OR chat.user2_id = :userId', { userId: userId })
                .getMany();

            if (chatIds.length > 0) {
                await Promise.all(chatIds.map((chat) => emitChatMetadata(userId, chat.chat_id)));
            }
        }
        res.status(200).send('Deleted successfully.');
    } catch {
        res.status(404).send('Not found.');
    }
};
