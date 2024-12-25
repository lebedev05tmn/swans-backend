import express, { Request, Response } from 'express';

import auth_functions from '../controllers/authorization'


export const authRouter = express.Router();

/**
 * @openapi
 * /api/auth/first_registration:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     description: Создание пользователя в БД, а также создание записи конкретной авторизации пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: number
 *                 description: Сторонний идентификатор от сервиса авторизации
 *               service_name:
 *                 type: string
 *                 description: Название стороннего ресурса
 *                 example: Telegram
 *     responses:
 *       200:
 *         description: Пользователь и его авторизация успешно созданы и добавлены в БД
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: Уникальный идентификатор пользователя в БД
 *                   example: 76d1b9738d607f6af8d0d1469477be9ce7b5422719f794521e071d04335d6cfe
 *                 access_token:
 *                   type: string
 *                   desctiption: JWT для сессий
 *                   expample: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmQxYjk3MzhkNjA3ZjZhZjhkMGQxNDY5NDc3YmU5Y2U3YjU0MjI3MTlmNzk0NTIxZTA3MWQwNDMzNWQ2Y2ZlIiwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yMlQxMjowODoxNy4zMTBaIiwiaWF0IjoxNzM0ODY5Mjk3LCJleHAiOjE3MzQ5NTU2OTd9.dfVNC0KuAKizjPNaTD9qjrvgze56OIMJyGKgbK7jUYg
 *                 refresh_token:
 *                   type: string
 *                   description: Refresh Token для обновления Access токена
 *                   expample: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmQxYjk3MzhkNjA3ZjZhZjhkMGQxNDY5NDc3YmU5Y2U3YjU0MjI3MTlmNzk0NTIxZTA3MWQwNDMzNWQ2Y2ZlIiwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yMlQxMjowODoxNy4zMTBaIiwiaWF0IjoxNzM0ODY5Mjk3LCJleHAiOjE3MzQ5NTU2OTd9.dfVNC0KuAKizjPNaTD9qjrvgze56OIMJyGKgbK7jUYg
 *       400:
 *         description: Ошибка со стороны клиента. Проверьте запрос
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
authRouter.post('/first_registration', async (req: Request, res: Response) => {
    auth_functions.Authorization(req, res);
});
