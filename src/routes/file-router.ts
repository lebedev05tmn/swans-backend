import express from "express";
import {minioClient} from "../minio-client";
import {bucketName} from "../app";
import {HTTP_STATUSES} from "../utils";
import path from "node:path";
const uniqueId = require("uuid").v4();

export const fileRouter = express.Router()

fileRouter.get("/get-file/:uniq_id", async (req, res) => {
    if (req.params.uniq_id !== null && req.params.uniq_id !== undefined) {
        const fileName = req.params.uniq_id
        let found = false

        const stream = minioClient.listObjectsV2(bucketName)
        await stream.on('data', async (obj) => {
            if (obj.name?.includes(`${fileName}.`)) {
                found = true
                await res.status(HTTP_STATUSES.OK_200).send(obj)
            }
        })
        await stream.on('end', () => {
            if (!found) res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        })
    }
})

fileRouter.post("/upload-file", async (req, res) => {
    if (req.files) {
        const file = req.files.file
        const extname = path.extname(file.name);
        const id = uniqueId

        if(file) {
           await minioClient.putObject(bucketName, `${id}${extname}`, "/")
            .then(() => res.status(HTTP_STATUSES.CREATED_201).send(id))
            .catch((err)=> res.status(HTTP_STATUSES.NOT_FOUND_404).send(err))
        }
    }
})

fileRouter.delete("/delete-file/:uniq_id", async (req, res) => {
    const uniq_id = req.params.uniq_id
    let deleted = false

    const stream = minioClient.listObjectsV2(bucketName).map(object => object.name)
    await stream.on('data',  async (obj) => {
        if (obj.includes(`${uniq_id}.`)) {
            deleted = true
            await minioClient.removeObject(bucketName, obj)
                .then(() => res.sendStatus(HTTP_STATUSES.NO_CONTENT_204))
        }
    })
    await stream.on('end', (() => {
        if (!deleted) res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }))
})
