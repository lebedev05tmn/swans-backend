import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import { bucketName } from '../../shared/config';
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3client } from '../s3_client';
import { decodeUserId } from '../../core-auth/utils/getUserId';

export const uploadMedia = async (req: Request, res: Response) => {
    if (req.files) {
        const file = req.files.file as UploadedFile;
        const id = uuid();
        const userId = await decodeUserId(req.headers.authorization);

        let webpFileName: string;

        if (req.query.chat_id) webpFileName = `message/${req.query.chat_id}/${id}.webp`;
        else webpFileName = `profile/${userId}/${id}.webp`;

        try {
            const webpBuffer = await sharp(file.tempFilePath).resize({ height: 600 }).webp({ quality: 80 }).toBuffer();

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: webpFileName,
                Body: webpBuffer,
            });
            await s3client.send(command);
            return res.status(201).send(id);
        } catch (error) {
            return res.status(500).send(`Failed to upload media: ${error}`);
        }
    } else {
        return res.status(400).send('No files uploaded.');
    }
};
