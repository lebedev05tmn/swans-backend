import express, { Request, Response } from 'express';

import first_auth from '../controllers/authorization';
import get_access_token from '../controllers/getAccessToken';
import update_user_auth from '../controllers/updateAuth';
import refreshAccessToken from '../controllers/refreshAccessToken';
import server from '../utils/server';
import { forget_password } from '../controllers/forgetPassword';
import getUserAuthData from '../controllers/getUserAuthData';

export const authRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Взаимодействие с базой данных аутентификаций
 *   - name: Email
 *     description: Работа с электронной почтой
 */

/**
 * @openapi
 * /api/auth/get/user_auth_data:
 *   get:
 *     summary: Получение данных авторизации пользователя
 *     tags: [Auth]
 *     description: Возвращает данные авторизации пользователя на основе токена, переданного в заголовке Authorization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: Уникальный идентификатор пользователя в БД
 *                 resources:
 *                   type: array
 *                   description: Список ресурсов авторизации пользователя
 *                   items:
 *                     type: object
 *                     properties:
 *                       authId:
 *                         type: number
 *                         description: Уникальный идентификатор авторизации
 *                       serviceUserId:
 *                         type: number
 *                         description: Идентификатор пользователя в стороннем сервисе
 *                       serviceName:
 *                         type: string
 *                         description: Название стороннего сервиса
 *       401:
 *         description: Ошибка авторизации. Токен отсутствует, неверен или истек
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Описание ошибки
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Описание ошибки
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
 *                 details:
 *                   type: string
 *                   description: Подробное описание ошибки на сервере
 */
authRouter.get('/get/user_auth_data', async (req: Request, res: Response) => {
    getUserAuthData(req, res);
});

/**
 * @openapi
 * /api/auth/create_user:
 *   post:
 *     summary: Авторизация пользователя
 *     security:
 *       - basicAuth: []
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
 *                   description: JWT для сессий
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmQxYjk3MzhkNjA3ZjZhZjhkMGQxNDY5NDc3YmU5Y2U3YjU0MjI3MTlmNzk0NTIxZTA3MWQwNDMzNWQ2Y2ZlIiwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yMlQxMjowODoxNy4zMTBaIiwiaWF0IjoxNzM0ODY5Mjk3LCJleHAiOjE3MzQ5NTU2OTd9.dfVNC0KuAKizjPNaTD9qjrvgze56OIMJyGKgbK7jUYg
 *                 refresh_token:
 *                   type: string
 *                   description: Refresh Token для обновления Access токена
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
 *       500:
 *         description: Ошибка со стороны сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 details:
 *                   type: string
 *                   description: Подробное описание ошибки на сервере
 */
authRouter.post('/create_user', async (req: Request, res: Response) => {
    first_auth.Authorization(req, res);
});

/**
 * @openapi
 * /api/auth/get-tokens:
 *   post:
 *     summary: Получение access и refresh при повторной авторизации
 *     tags: [Auth]
 *     description: Обработка запроса, включающего service_user_id и service_name, для получения нового access и refresh токенов при повторной авторизации
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_user_id:
 *                 type: string
 *                 description: Сторонний идентификатор от сервиса авторизации
 *               service_name:
 *                 type: string
 *                 description: Название стороннего ресурса
 *                 example: Telegram
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
authRouter.post('/get-tokens', async (req: Request, res: Response) => {
    get_access_token.getAccessTokenByServiceAuth(req, res);
});

/**
 * @openapi
 * /api/auth/update/access_token:
 *   post:
 *     summary: Обновление Access Token
 *     security:
 *       - basicAuth: []
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
authRouter.post('/update/access_token', async (req: Request, res: Response) => {
    refreshAccessToken(req, res);
});

/**
 * @openapi
 * /api/auth/update/user_auth:
 *   patch:
 *     summary: Добавление новой авторизации пользователя
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     description: Поиск пользователя по базе данных и добавление в массив его авторизаций новой записи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
authRouter.patch('/update/user_auth', async (req: Request, res: Response) => {
    update_user_auth.updateUserAuth(req, res);
});

/**
 * @openapi
 * /api/auth/email_registration:
 *   post:
 *     summary: Обработка регистрации пользователя через email с использованием JSON-RPC
 *     security:
 *       - basicAuth: []
 *     tags:
 *       - Email
 *     description: |
 *       Этот эндпоинт обрабатывает регистрацию пользователя через email с использованием JSON-RPC.
 *       Поддерживает три метода: `send_code`, `verify_code` и `create_user`.
 *       Каждый метод соответствует этапу процесса регистрации.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/JsonRpcRequest"
 *     responses:
 *       200:
 *         description: Успешный ответ JSON-RPC
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/JsonRpcSuccessResponse"
 *       400:
 *         description: Ошибка клиента. Неверные параметры или состояние сессии.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/JsonRpcErrorResponse"
 *       500:
 *         description: Ошибка сервера при обработке запроса.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/JsonRpcErrorResponse"
 *
 * components:
 *   schemas:
 *     JsonRpcRequest:
 *       type: object
 *       properties:
 *         jsonrpc:
 *           type: string
 *           example: "2.0"
 *           description: Версия JSON-RPC (должна быть "2.0")
 *         method:
 *           type: string
 *           description: |
 *             Метод, который нужно вызвать. Доступные методы:
 *             - `send_code` — отправка кода подтверждения на email.
 *             - `verify_code` — проверка кода подтверждения.
 *             - `create_user` — создание пользователя после успешной проверки кода.
 *           example: "send_code"
 *         params:
 *           type: object
 *           description: |
 *             Параметры для вызова метода. Зависят от выбранного метода:
 *             - Для `send_code`: `{ "email": "user@example.com" }`
 *             - Для `verify_code`: `{ "session_id": "session-id", "code": "12345" }`
 *             - Для `create_user`: `{ "session_id": "session-id", "email": "user@example.com", "password": "secure-password" }`
 *           example: { "email": "user@example.com" }
 *         id:
 *           type: string
 *           description: Уникальный идентификатор запроса (например, "1").
 *           example: "1"
 *       required:
 *         - jsonrpc
 *         - method
 *         - params
 *         - id
 *
 *     JsonRpcSuccessResponse:
 *       type: object
 *       properties:
 *         jsonrpc:
 *           type: string
 *           example: "2.0"
 *         result:
 *           type: object
 *           description: Результат выполнения метода.
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             session_id:
 *               type: string
 *               example: "session-id"
 *         id:
 *           type: string
 *           example: "1"
 *
 *     JsonRpcErrorResponse:
 *       type: object
 *       properties:
 *         jsonrpc:
 *           type: string
 *           example: "2.0"
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: integer
 *               example: -32602
 *             message:
 *               type: string
 *               example: "Неверные параметры"
 *         id:
 *           type: string
 *           example: "1"
 */
authRouter.post('/email_registration', async (req: Request, res: Response) => {
    const jsonRPCRequest = req.body;
    const response = await server.receive(jsonRPCRequest);
    if (response) {
        res.json(response);
    }
});

/**
 * @openapi
 * /api/auth/send_new_password:
 *   post:
 *     summary: Высылание на почту нового пароля
 *     security:
 *       - bearerAuth: []
 *     tags: [Email]
 *     description: Высылание на почту нового пароля, который заново записывается в базу данных
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Почта пользователя
 *     responses:
 *       200:
 *         description: Успешное обновление пароля
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
authRouter.post('/send_new_password', async (req: Request, res: Response) => {
    forget_password(req, res);
});
