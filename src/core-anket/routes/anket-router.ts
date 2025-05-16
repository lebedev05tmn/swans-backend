import express, { Request, Response } from 'express';

import server from '../../shared/utils/server';
import { like_user } from '../controllers/likeUser/likeUser';
import { get_likes_list } from '../controllers/getLikesList/getLikesList';

export const anketRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Anket
 *     description: Работа с анкетами
 */

anketRouter.get('/dating', async (req: Request, res: Response) => {
    const jsonRPCRequest = req.body;
    const response = await server.receive(jsonRPCRequest);
    if (response) {
        res.json(response);
    }
});

/**
 * @openapi
 * /api/anket/get_likes_list:
 *   get:
 *     summary: Получение списка лайкнувших
 *     security:
 *       - bearerAuth: []
 *     tags: [Anket]
 *     description: Поиск пользователя по базе данных и добавление в массив его авторизаций новой записи
 *     responses:
 *       200:
 *         description: Получение списка лайкнувших
 *       400:
 *         description: Ошибка со стороны клиента. Проверьте запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Ошибка связанная с поиском пользователя в БД
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         desctiption: Ошибка со стороны сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 details:
 *                   type: string
 *                   desctiption: Подробное описание ошибки на сервере
 */
anketRouter.get('/get_likes_list', async (req: Request, res: Response) => {
    get_likes_list(req, res);
});

anketRouter.post('/like_user', async (req: Request, res: Response) => {
    like_user(req, res);
});
