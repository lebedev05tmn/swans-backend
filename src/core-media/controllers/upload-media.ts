import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Сlient } from '../s3_client';
import { decodeUserId } from '../../core-auth/utils/getUserId';
import { chatsRepository, profileRepository } from '../../shared/config';
import { emitChatMetadata } from '../../shared/utils';

export const uploadMedia = async (req: Request, res: Response) => {
    if (req.files) {
        const file = req.files.file as UploadedFile;
        const id = uuid();
        const userId = await decodeUserId(req.headers.authorization);
        let webpFileName: string;

        if (req.query.chat_id) webpFileName = `message/${req.query.chat_id}/${id}.webp`;
        else webpFileName = `profile/${userId}/${id}.webp`;

        const profile = await profileRepository.findOneByOrFail({ user: { user_id: userId } });

        const currentProfilePicture = profile.images[0];

        try {
            const webpBuffer = await sharp(file.tempFilePath).resize({ height: 600 }).webp({ quality: 80 }).toBuffer();

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: webpFileName,
                Body: webpBuffer,
            });
            await s3Сlient.send(command);

            const profile = await profileRepository.findOneByOrFail({ user: { user_id: userId } });

            const newProfilePicture = profile.images[0];

            if (currentProfilePicture !== newProfilePicture) {
                const chats = await chatsRepository
                    .createQueryBuilder('chat')
                    .select(['chat.chat_id'])
                    .where('chat.user1_id = :userId OR chat.user2_id = :userId', { userId: userId })
                    .getMany();

                if (chats.length > 0) {
                    await Promise.all(chats.map((chat) => emitChatMetadata(userId, chat.chat_id)));
                }
            }
            return res.status(201).send(id);
        } catch (error) {
            return res.status(500).send(`Failed to upload media: ${error}`);
        }
    } else {
        return res.status(400).send('No files uploaded.');
    }
};
