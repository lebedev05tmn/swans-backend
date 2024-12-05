import { minioClient } from './minio-client';
import { bucketName } from './utils';

export const initMedia = async () => {
    await minioClient.bucketExists(bucketName).then((exists) => {
        if (!exists) {
            minioClient.makeBucket('swans-pics');
        }
    });
};
