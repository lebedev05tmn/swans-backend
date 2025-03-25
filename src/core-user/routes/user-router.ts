import express from 'express';
import { AppDataSource } from '../../../src/shared/model';
import { User } from '../models/entities/User';
import getUserId from '../../core-auth/utils/getUserId';

export const userRouter = express.Router();

/**
 * @openapi
 * tags:
 *   name: Metadata
 *   description: Взаимодействие с таблицой метаданных
 */

/**
 * @openapi
 * /api/metadata/get:
 *   get:
 *     summary: Получить профиль по id
 *     security:
 *       - bearerAuth: []
 *     tags: [Metadata]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Профиль не найден
 *       500:
 *         description: Ошибка на стороне сервера
 */
userRouter.get('/get', async (req, res) => {
    const user_id = getUserId(req, res);

    if(!user_id) res.send()

    res.json(
        user_id !== undefined
            ? await AppDataSource.getRepository(User).findOneBy({
                  user_id: req.query.user_id as string,
              })
            : {},
    );
});

/**
 * @openapi
 * /api/metadata/update:
 *   get:
 *     summary: Получить профиль по id
 *     security:
 *       - bearerAuth: []
 *     tags: [Metadata]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Профиль не найден
 *       500:
 *         description: Ошибка на стороне сервера
 */
userRouter.patch('/update');
