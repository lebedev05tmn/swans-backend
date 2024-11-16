import express from "express";
import {minioClient} from "./minio-client";
import {fileRouter} from "./routes/file-router";
import fileUpload from "express-fileupload";

export const app = express()

app.use(express.json())
app.use(fileUpload())

app.use('/file', fileRouter)

export const bucketName = 'swans-pics'
minioClient.bucketExists(bucketName).then(exists => {
    if (!exists) {
        minioClient.makeBucket('swans-pics')
    }
})