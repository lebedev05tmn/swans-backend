import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

const port = process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000;

export const s3client = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: String(process.env.S3_ACCESS_KEY),
        secretAccessKey: String(process.env.S3_SECRET_KEY),
    },
});
