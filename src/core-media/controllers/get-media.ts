import { bucketName, getFileContentType } from '../../shared/config';
import { minioClient } from '../minio-client';
import { getKey } from '../utils';
import { HTTP_STATUSES } from '../../shared/utils';
import { Request, Response } from 'express';

export const getMedia = async (req: Request, res: Response) => {
    if (req.params.id !== null && req.params.id !== undefined) {
        let objectKey = await getKey(req.params.id);

        let contentType = await getFileContentType(objectKey as string);

        try {
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
                        'Content-Type': contentType,
                    });
                    return res.end(data);
                });
            }
        } catch (err) {
            console.error('MinIO Error:', err);
            return res
                .status(500)
                .send('Error occurred while retrieving the file.');
        }
    } else {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).send('Request error.');
    }
};
