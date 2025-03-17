import { Request, Response } from 'express';
import { s3BucketName } from '../../shared/utils';
import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { s3client } from '../s3_client';

export const deleteMedia = async (req: Request, res: Response) => {
    const id = req.params.id;

    let command = new HeadObjectCommand({
        Bucket: s3BucketName,
        Key: `${id}.webp`,
    });

    try {
        await s3client.send(command);

        command = new DeleteObjectCommand({
            Bucket: s3BucketName,
            Key: `${id}.webp`,
        });

        await s3client.send(command);
        res.status(200).send('Deleted successfully.');
    } catch (error) {
        res.status(404).send('Not found.');
    }
};
