import { bucketName } from '../../shared/config';
import { minioClient } from '../minio-client';

export const getKey = async (id: string) => {
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
