import * as Minio from 'minio';
import 'dotenv/config';

const port = process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000;

export const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: port,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
});
