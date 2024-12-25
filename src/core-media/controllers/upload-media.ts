import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import { minioClient } from '../minio-client';
import { HTTP_STATUSES } from '../../shared/utils';
import { bucketName } from '../../shared/config';
import sharp from 'sharp';

export const uploadMedia = async (req: Request, res: Response) => {
    if (req.files) {
        const file = req.files.file as UploadedFile;
        const id = uuid();
        const webpFileName = `${id}.webp`;

        try {
            const webpBuffer = await sharp(file.tempFilePath)
                .resize({ height: 600 })
                .webp({ quality: 80 })
                .toBuffer();

            await minioClient.putObject(bucketName, webpFileName, webpBuffer);
            return res.status(HTTP_STATUSES.CREATED_201).send(id);
        } catch (error) {
            return res.status(500).send(`Failed to upload media: ${error}`);
        }
    } else {
        return res
            .status(HTTP_STATUSES.BAD_REQUEST_400)
            .send('No files uploaded.');
    }
};
