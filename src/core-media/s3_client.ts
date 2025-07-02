import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

export const s3Сlient = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: String(process.env.S3_ACCESS_KEY),
        secretAccessKey: String(process.env.S3_SECRET_KEY),
    },
});
