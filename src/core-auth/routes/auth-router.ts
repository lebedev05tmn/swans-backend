import express, { Request, Response } from 'express';

import first_auth from '../controllers/authorization';
import get_access_token from '../controllers/getAccessToken';
import update_user_auth from '../controllers/updateAuth';
import refreshAccessToken from '../../core-auth/controllers/refreshAccessToken';

export const authRouter = express.Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Взаимодействие с базой данных аутентификаций
 */

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
 *                 type: string
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
    first_auth.Authorization(req, res);
});

/**
 * @openapi
 * /api/auth/auth_user/{service_user_id}/{service_name}:
 *   get:
 *     summary: Получение access и refresh при повторной авторизации
 *     tags: [Auth]
 *     description: Обработка запроса, включающего service_user_id и service_name, для получения нового access и refresh токенов
 *     parameters:
 *       - name: service_user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный идентификатор пользователя от стороннего ресурса
 *       - name: service_name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Наименование стороннего ресурса
 *     responses:
 *       200:
 *         description: Введенные данные успешно найдены в базе данных, и также успешно сгенерированы новые токены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: Access token
 *                 refresh_token:
 *                   type: string
 *                   desctiption: Refresh token
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
 *         description: Ошибка при получении данных. 
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
authRouter.get(
    '/auth_user/:service_user_id/:service_name',
    async (req: Request, res: Response) => {
        get_access_token.getAccessTokenByServiceAuth(req, res);
    },
);

/**
 * @openapi
 * /api/auth/update_user_auth:
 *   patch:
 *     summary: Добавление новой авторизации пользователя
 *     tags: [Auth]
 *     description: Поиск пользователя по базе данных и добавление в массив его авторизаций новой записи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Идентификатор пользователя нашего приложения
 *               service_user_id:
 *                 type: string
 *                 description: Сторонний идентификатор пользователя от сервиса
 *               service_name:
 *                 type: string
 *                 description: Название стороннего сервиса
 *     responses:
 *       200:
 *         description: Пользователь и его авторизация успешно созданы и добавлены в БД
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
authRouter.patch('/update_user_auth', async (req: Request, res: Response) => {
    update_user_auth.updateUserAuth(req, res);
});

/**
 * @openapi
 * /api/auth/refresh_token:
 *   post:
 *     summary: Обновление Access Token
 *     tags: [Auth]
 *     description: Генерация нового Access Token и Refresh Token на основе действующего Refresh Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh Token пользователя
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmQxYjk3MzhkNjA3ZjZhZjhkMGQxNDY5NDc3YmU5Y2U3YjU0MjI3MTlmNzk0NTIxZTA3MWQwNDMzNWQ2Y2ZlIiwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yMlQxMjowODoxNy4zMTBaIiwiaWF0IjoxNzM0ODY5Mjk3LCJleHAiOjE3MzQ5NTU2OTd9.dfVNC0KuAKizjPNaTD9qjrvgze56OIMJyGKgbK7jUYg
 *     responses:
 *       200:
 *         description: Успешное обновление токенов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Новый Access Token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmQxYjk3MzhkNjA3ZjZhZjhkMGQxNDY5NDc3YmU5Y2U3YjU0MjI3MTlmNzk0NTIxZTA3MWQwNDMzNWQ2Y2ZlIiwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yMlQxMjowODoxNy4zMTBaIiwiaWF0IjoxNzM0ODY5Mjk3LCJleHAiOjE3MzQ5NTU2OTd9.dfVNC0KuAKizjPNaTD9qjrvgze56OIMJyGKgbK7jUYg
 *                 refreshToken:
 *                   type: string
 *                   description: Новый Refresh Token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmQxYjk3MzhkNjA3ZjZhZjhkMGQxNDY5NDc3YmU5Y2U3YjU0MjI3MTlmNzk0NTIxZTA3MWQwNDMzNWQ2Y2ZlIiwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yMlQxMjowODoxNy4zMTBaIiwiaWF0IjoxNzM0ODY5Mjk3LCJleHAiOjE3MzQ5NTU2OTd9.dfVNC0KuAKizjPNaTD9qjrvgze56OIMJyGKgbK7jUYg
 *       400:
 *         description: Ошибка со стороны клиента. Проверьте запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing refresh token!
 *       401:
 *         description: Недействительный или истекший Refresh Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired refresh token!
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found!
 *       500:
 *         description: Ошибка со стороны сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Описание ошибки
 *                   example: Error occurred while refreshing token.
 *                 details:
 *                   type: string
 *                   description: Подробное описание ошибки
 */
authRouter.post('/refresh_token', async (req: Request, res: Response) => {
    refreshAccessToken(req, res);
});

authRouter.get('/send_message')