import express from 'express';
import config from '../../shared/config/frontend.json';

const contextRouter = express.Router();

/**
 * @openapi
 * tags:
 *   name: Context
 *   description: Контекст приложения
 */

/**
 * @openapi
 * /api/context:
 *   get:
 *     summary: Получение контекста
 *     description: Получает контекст фронтенд-приложения
 *     tags: [Context]
 *     responses:
 *       200:
 *         description: Контекст успешно получен
 *       401:
 *         description: Неавторизованный — токен отсутствует или недействителен
 *       500:
 *         description: Внутренняя ошибка сервера
 */
contextRouter.get('/', (_, res) => {
    res.json(config);
});

export { contextRouter };
