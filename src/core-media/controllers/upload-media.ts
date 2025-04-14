import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Сlient } from '../s3_client';

export const uploadMedia = async (req: Request, res: Response) => {
    if (req.files) {
        const file = req.files.file as UploadedFile;
        const id = uuid();
        const webpFileName = `${id}.webp`;

        try {
            const webpBuffer = await sharp(file.tempFilePath).resize({ height: 600 }).webp({ quality: 80 }).toBuffer();

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: webpFileName,
                Body: webpBuffer,
            });
            await s3Сlient.send(command);
            return res.status(201).send(id);
        } catch (error) {
            return res.status(500).send(`Failed to upload media: ${error}`);
        }
    } else {
        return res.status(400).send('No files uploaded.');
    }
};
