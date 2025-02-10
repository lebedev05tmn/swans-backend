import express, { Request, Response } from 'express';

import getUserAuthData from '../controllers/getUserAuthData';

export const userRouter = express.Router();

/**
 * @openapi
 * /api/user/user_auth_data:
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
userRouter.get('/user_auth_data', async (req: Request, res: Response) => {
    getUserAuthData(req, res);
});


