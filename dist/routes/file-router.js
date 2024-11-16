"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRouter = void 0;
const express_1 = __importDefault(require("express"));
const minio_client_1 = require("../minio-client");
const app_1 = require("../app");
const utils_1 = require("../utils");
const node_path_1 = __importDefault(require("node:path"));
const uniqueId = require("uuid").v4();
exports.fileRouter = express_1.default.Router();
exports.fileRouter.get("/get-file/:uniq_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.uniq_id !== null && req.params.uniq_id !== undefined) {
        const fileName = req.params.uniq_id;
        let found = false;
        const stream = minio_client_1.minioClient.listObjectsV2(app_1.bucketName);
        yield stream.on('data', (obj) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if ((_a = obj.name) === null || _a === void 0 ? void 0 : _a.includes(`${fileName}.`)) {
                found = true;
                yield res.status(utils_1.HTTP_STATUSES.OK_200).send(obj);
            }
        }));
        yield stream.on('end', () => {
            if (!found)
                res.sendStatus(utils_1.HTTP_STATUSES.NOT_FOUND_404);
        });
    }
}));
exports.fileRouter.post("/upload-file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files) {
        const file = req.files.file;
        const extname = node_path_1.default.extname(file.name);
        const id = uniqueId;
        if (file) {
            yield minio_client_1.minioClient.putObject(app_1.bucketName, `${id}${extname}`, "/")
                .then(() => res.status(utils_1.HTTP_STATUSES.CREATED_201).send(id))
                .catch((err) => res.status(utils_1.HTTP_STATUSES.NOT_FOUND_404).send(err));
        }
    }
}));
exports.fileRouter.delete("/delete-file/:uniq_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uniq_id = req.params.uniq_id;
    let deleted = false;
    const stream = minio_client_1.minioClient.listObjectsV2(app_1.bucketName).map(object => object.name);
    yield stream.on('data', (obj) => __awaiter(void 0, void 0, void 0, function* () {
        if (obj.includes(`${uniq_id}.`)) {
            deleted = true;
            yield minio_client_1.minioClient.removeObject(app_1.bucketName, obj)
                .then(() => res.sendStatus(utils_1.HTTP_STATUSES.NO_CONTENT_204));
        }
    }));
    yield stream.on('end', (() => {
        if (!deleted)
            res.sendStatus(utils_1.HTTP_STATUSES.NOT_FOUND_404);
    }));
}));
