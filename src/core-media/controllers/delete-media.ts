import { Request, Response } from 'express';
import { bucketName } from '../../shared/config';
import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { s3client } from '../s3_client';
import { decodeUserId } from '../../core-auth/utils/getUserId';

export const deleteMedia = async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = await decodeUserId(req.headers.authorization);
    let fileName: string;

    if (req.query.chat_id) fileName = `message/${req.query.chat_id}/${id}.webp`;
    else fileName = `profile/${userId}/${id}.webp`;

    let command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    try {
        await s3client.send(command);

        command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: `${id}.webp`,
        });

        await s3client.send(command);
        res.status(200).send('Deleted successfully.');
    } catch {
        res.status(404).send('Not found.');
    }
};
