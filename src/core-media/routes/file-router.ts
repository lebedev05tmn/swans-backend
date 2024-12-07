import express from 'express';
import { minioClient } from '../minio-client';
import path from 'node:path';
import * as fs from 'node:fs';
import { UploadedFile } from 'express-fileupload';
import { bucketName } from '../utils';
import { HTTP_STATUSES } from '../../shared/utils';
const uniqueId = require('uuid');

export const fileRouter = express.Router();

const getKey = async (id: string) => {
    return new Promise((resolve, reject) => {
        const stream = minioClient
            .listObjectsV2(bucketName)
            .map((object) => object.name);
        stream.on('data', async (obj) => {
            if (obj.includes(`${id}.`)) {
                resolve(obj);
            }
        });
    });
};

/**
 * @openapi
 * /api/get-file/id:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */

fileRouter.get('/get-file/:uniq_id', async (req, res) => {
    if (req.params.uniq_id !== null && req.params.uniq_id !== undefined) {
        let objectKey = await getKey(req.params.uniq_id);

        let contentType: string;
        switch (path.extname(<string>objectKey)) {
            case '.jpg':
                contentType = 'image/jpeg';
                break;
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
        }

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
                    res.end(data);
                });
            }
        } catch (err) {
            console.error('MinIO Error:', err);
            res.status(500).send('Error occurred while retrieving the file.');
        }
    } else {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
    }
});

fileRouter.post('/upload-file', async (req, res) => {
    if (req.files) {
        const file = req.files.file as UploadedFile;
        const extname = path.extname(file.name);
        const id = uniqueId.v4();
        const fileStream = fs.createReadStream(file.tempFilePath);

        if (file) {
            await minioClient
                .putObject(bucketName, `${id}${extname}`, fileStream)
                .then(() => res.status(HTTP_STATUSES.CREATED_201).send(id))
                .catch((err) =>
                    res.status(HTTP_STATUSES.NOT_FOUND_404).send(err),
                );
        }
    }
});

fileRouter.delete('/delete-file/:uniq_id', async (req, res) => {
    const uniq_id = req.params.uniq_id;
    let deleted = false;

    const stream = minioClient
        .listObjectsV2(bucketName)
        .map((object) => object.name);
    stream.on('data', async (obj) => {
        if (obj.includes(`${uniq_id}.`)) {
            deleted = true;
            await minioClient
                .removeObject(bucketName, obj)
                .then(() => res.sendStatus(HTTP_STATUSES.NO_CONTENT_204));
        }
    });
    await stream.on('end', () => {
        if (!deleted) res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    });
});
