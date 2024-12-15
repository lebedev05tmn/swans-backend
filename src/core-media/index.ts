import { minioClient } from './minio-client';
import { bucketName } from '../shared/config';
export const initMedia = async () => {
    try {
        await minioClient.bucketExists(bucketName).then((exists) => {
            if (!exists) {
                minioClient.makeBucket('swans-pics');
            }
        });
    } catch (error) {
        console.error(`Failed to create minio bucket: ${error}`);
    }
};
