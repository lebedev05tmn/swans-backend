import { bucketName, getFileContentType } from '../../shared/config';
import { minioClient } from '../minio-client';
import { HTTP_STATUSES } from '../../shared/utils';
import { Request, Response } from 'express';

export const getMedia = async (req: Request, res: Response) => {
    if (req.params.id !== null && req.params.id !== undefined) {
        try {
            const objectKey = `${req.params.id}.webp`;

            let objStream;
            if (typeof objectKey === 'string') {
                objStream = await minioClient.getObject(bucketName, objectKey);
            }

            let data: Buffer = Buffer.alloc(0);

            if (objStream) {
                objStream.on('data', (chunk: Buffer) => {
                    data = Buffer.concat([data, chunk]);
                });

                objStream.on('end', () => {
                    res.writeHead(HTTP_STATUSES.OK_200, {
                        'Content-Type': 'image/webp',
                    });
                    return res.end(data);
                });
            }
        } catch (error) {
            return res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .send(`No image with such ID`);
        }
    } else {
        return res.status(500).send('Server error.');
    }
};
