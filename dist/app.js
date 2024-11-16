"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketName = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const minio_client_1 = require("./minio-client");
const file_router_1 = require("./routes/file-router");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, express_fileupload_1.default)());
exports.app.use('/file', file_router_1.fileRouter);
exports.bucketName = 'swans-pics';
minio_client_1.minioClient.bucketExists(exports.bucketName).then(exists => {
    if (!exists) {
        minio_client_1.minioClient.makeBucket('swans-pics');
    }
});
