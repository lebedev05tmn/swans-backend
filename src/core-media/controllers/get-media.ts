import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response } from 'express';
import { s3Сlient } from '../s3_client';
import { decodeUserId } from '../../core-auth/utils/getUserId';

export const getMedia = async (req: Request, res: Response) => {
    if (req.params.id !== null && req.params.id !== undefined) {
        const userId = await decodeUserId(req.headers.authorization);
        let fileName: string;

        if (req.query.chat_id) fileName = `message/${req.query.chat_id}/${req.params.id}.webp`;
        else fileName = `profile/${userId}/${req.params.id}.webp`;

        try {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
            });

            const image = await s3Сlient.send(command);

            if (image.Body) {
                const buffer = Buffer.from(await image.Body.transformToByteArray());
                res.setHeader('Content-Type', 'image/webp');
                res.status(200).end(buffer);
            }
        } catch {
            return res.status(404).send(`Not found.`);
        }
    } else {
        return res.status(500).send('Server error.');
    }
};
