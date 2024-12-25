import express, { Request, Response } from 'express';

import getUserAuthData from '../controllers/getUserAuthData';
import refreshAccessToken from '../controllers/refreshAccessToken';


export const userRouter = express.Router();

/**
 * @openapi
 * /api/user/userAuthData:
 *   get:
 *     summary: Получение данных авторизации пользователя
 *     tags: [User]
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

userRouter.get("/userAuthData", async (req: Request, res: Response) => {
    getUserAuthData(req, res);
});

/**
 * @openapi
 * /api/user/refresh-token:
 *   post:
 *     summary: Обновление Access Token
 *     tags: [User]
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
userRouter.post("/refreshToken", async (req: Request, res: Response) => {
    refreshAccessToken(req, res);
})
