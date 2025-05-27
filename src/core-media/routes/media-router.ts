import express from 'express';
import { Request, Response } from 'express';
import { getMedia } from '../controllers/get-media';
import { uploadMedia } from '../controllers/upload-media';
import { deleteMedia } from '../controllers/delete-media';

export const mediaRouter = express.Router();

/**
 * @openapi
 * tags:
 *   name: Media
 *   description: Взаимодействие с хранилищем медиафайлов
 */

/**
 * @openapi
 * /api/media/get/{id}:
 *   get:
 *     summary: Получить медиафайл по id
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: id медиафайла
 *     responses:
 *       200:
 *         description: Изображение успешно получено
 *         content:
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Изображение с таким id не найдено
 *       500:
 *         description: Ошибка на стороне сервера
 */
mediaRouter.get('/get/:id', async (req: Request, res: Response) => {
    getMedia(req, res);
});

/**
 * @openapi
 * /api/media/create:
 *   post:
 *     summary: Загрузка изображения в хранилище
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Media
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Изображение для загрузки
 *     responses:
 *       201:
 *         description: Изображение успешно загружено
 *         content:
 *           text/html:
 *             schema:
 *             type: string
 *       400:
 *         description: Не обнаружен загруженный файл
 */
mediaRouter.post('/create', async (req: Request, res: Response) => {
    uploadMedia(req, res);
});

/**
 * @openapi
 * /api/media/delete/{id}:
 *   delete:
 *     summary: Удалить медиафайл по id
 *     security:
 *       - bearerAuth: []
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: id медиафайла
 *     responses:
 *       200:
 *         description: Файл удален успешно
 *       404:
 *         description: Файл не найден
 *       500:
 *         description: Ошибка на стороне сервера
 */
mediaRouter.delete('/delete/:id', async (req: Request, res: Response) => {
    deleteMedia(req, res);
});
