import { GetObjectCommand } from '@aws-sdk/client-s3';
import { bucketName } from '../../shared/config';
import { Request, Response } from 'express';
import { s3client } from '../s3_client';

export const getMedia = async (req: Request, res: Response) => {
    if (req.params.id !== null && req.params.id !== undefined) {
        const fileName = `${req.params.id}.webp`;

        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: fileName,
            });

            const image = await s3client.send(command);

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
