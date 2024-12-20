import { Request, Response } from 'express';
import { minioClient } from '../minio-client';
import { bucketName } from '../../shared/config';
import { HTTP_STATUSES } from '../../shared/utils';

export const deleteMedia = (req: Request, res: Response) => {
    const id = req.params.id;
    let deleted = false;

    const stream = minioClient
        .listObjectsV2(bucketName)
        .map((object) => object.name);
    stream.on('data', async (obj) => {
        if (obj.includes(`${id}.`)) {
            deleted = true;
            await minioClient.removeObject(bucketName, obj).then(() => {
                return res
                    .status(HTTP_STATUSES.NO_CONTENT_204)
                    .send('Image deleted successfully');
            });
        }
    });
    stream.on('end', () => {
        if (!deleted) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    });
};
