import { Request, Response } from 'express';
import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { s3Сlient } from '../s3_client';
import { decodeUserId } from '../../core-auth/utils/getUserId';

export const deleteMedia = async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = decodeUserId(req.headers.authorization);

    if (!userId) throw new Error();

    let command = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${id}.webp`,
    });

    try {
        await s3Сlient.send(command);

        command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${id}.webp`,
        });

        await s3Сlient.send(command);

        res.status(200).send('Deleted successfully.');
    } catch {
        res.status(404).send('Not found.');
    }
};
