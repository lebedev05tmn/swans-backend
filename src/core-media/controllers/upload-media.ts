import { Request, Response } from 'express';
import path from 'path';
import * as fs from 'node:fs';
import { v4 as uuid } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import { minioClient } from '../minio-client';
import { HTTP_STATUSES } from '../../shared/utils';
import { bucketName } from '../../shared/config';

export const uploadMedia = async (req: Request, res: Response) => {
    if (req.files) {
        const file = req.files.file as UploadedFile;
        const extname = path.extname(file.name);
        const id = uuid();
        const fileStream = fs.createReadStream(file.tempFilePath);

        if (file) {
            await minioClient
                .putObject(bucketName, `${id}${extname}`, fileStream)
                .then(() => {
                    return res.status(HTTP_STATUSES.CREATED_201).send(id);
                })
                .catch((err) => {
                    return res.status(HTTP_STATUSES.NOT_FOUND_404).send(err);
                });
        }
    } else {
        return res
            .status(HTTP_STATUSES.BAD_REQUEST_400)
            .send(`No files uploaded.`);
    }
};
