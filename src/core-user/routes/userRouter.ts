import express from 'express';
import getUser from '../controllers/get-user';
import updateUser from '../controllers/update-user';
import { AppDataSource } from '../../shared/model';
import { User } from '../models/entities/User';

export const userRouter = express.Router();
export const userRepository = AppDataSource.getRepository(User);

/**
 * @openapi
 * tags:
 *   name: Metadata
 *   description: Взаимодействие с таблицой метаданных
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Metadata:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           description: The unique identifier for the user
 *         refresh_token:
 *           type: string
 *           nullable: true
 *           description: Refresh token for authentication
 *         geolocation:
 *           type: object
 *           properties:
 *             x:
 *               type: number
 *               format: float
 *             y:
 *               type: number
 *               format: float
 *           nullable: true
 *           description: Geographic coordinates of the user
 *         online:
 *           type: boolean
 *           nullable: true
 *           description: Online status of the user
 *         last_visit:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last visit timestamp
 *         verify:
 *           type: boolean
 *           nullable: true
 *           description: Verification status
 *         premium:
 *           type: boolean
 *           nullable: true
 *           description: Premium membership status
 *         super_likes:
 *           type: number
 *           nullable: true
 *           description: Number of super likes available
 *         returns:
 *           type: number
 *           nullable: true
 *           description: Number of returns available
 *         background_mode:
 *           type: boolean
 *           nullable: true
 *           description: Background mode preference
 *         locale:
 *           type: string
 *           nullable: true
 *           description: User's locale/language preference
 *         banned:
 *           type: boolean
 *           nullable: true
 *           description: Account ban status
 *         reported:
 *           type: number
 *           nullable: true
 *           description: Number of times user has been reported
 *         socket_id:
 *           type: string
 *           nullable: true
 *           description: User's socket ID for real-time communication
 *       example:
 *         user_id: "123e4567-e89b-12d3-a456-426614174000"
 *         refresh_token: "some_refresh_token"
 *         geolocation: {"x": 50.4501, "y": 30.5234}
 *         online: true
 *         last_visit: "2023-01-01T12:00:00Z"
 *         verify: true
 *         premium: false
 *         super_likes: 5
 *         returns: 2
 *         background_mode: false
 *         locale: "en-US"
 *         banned: false
 *         reported: 0
 *         socket_id: "123e4567-e89b-12d3-a456-426614174000"
 */

/**
 * @openapi
 * /api/metadata/get:
 *   get:
 *     summary: Получение метаданных пользователя
 *     description: Извлекает метаданные для аутентифицированного пользователя.
 *     security:
 *       - bearerAuth: []
 *     tags: [Metadata]
 *     responses:
 *       200:
 *         description: Метаданные пользователя успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metadata'
 *       401:
 *         description: Неавторизованный — токен отсутствует или недействителен
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */

userRouter.get('/get', getUser);

/**
 * @openapi
 * /api/metadata/update:
 *   patch:
 *     summary: Обновление метаданных пользователя
 *     description: Обновляет метаданные для аутентифицированного пользователя
 *     security:
 *       - bearerAuth: []
 *     tags: [Metadata]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               geolocation:
 *                 type: object
 *                 properties:
 *                   x:
 *                    type: number
 *                    format: float
 *                   y:
 *                     type: number
 *                     format: float
 *                 nullable: true
 *               online:
 *                 type: boolean
 *                 nullable: true
 *               last_visit:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               verify:
 *                 type: boolean
 *                 nullable: true
 *               premium:
 *                 type: boolean
 *                 nullable: true
 *               super_likes:
 *                 type: number
 *                 nullable: true
 *               returns:
 *                 type: number
 *                 nullable: true
 *               background_mode:
 *                 type: boolean
 *                 nullable: true
 *               locale:
 *                 type: string
 *                 nullable: true
 *               banned:
 *                 type: boolean
 *                 nullable: true
 *               reported:
 *                 type: number
 *                 nullable: true
 *               socket_id:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Метаданные пользователя успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metadata'
 *       400:
 *         description: Неверные входные данные
 *       401:
 *         description: Неавторизованный — токен отсутствует или недействителен
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
userRouter.patch('/update', updateUser);

userRouter.get(
    '/hahah',
    async () =>
        await updateUser(
            {
                headers: {
                    'Content-Type': 'application/json',
                    authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMTdlM2VkYjBjNjVhMDgyNzg2YWFjM2FkZGE2NzFiNmVjNjIwM2JlOGU1YjMyZWU4ZDBiY2MzYTcwZTAyMzgwIiwiY3JlYXRlZEF0IjoiMjAyNS0wNC0wM1QyMjoxMTowMi45OThaIiwiaWF0IjoxNzQzNzE4MjYyLCJleHAiOjE3NDM4MDQ2NjJ9.MlYNfCOV6kf8X_vXpecG1nyPGEHV22QrqWQ9h3Ak35o',
                },
                body: {
                    socket_id: '123e4567-e89b-12d3-a456-426614174000',
                },
            } as any,
            {
                json: (value: any) => {
                    console.log(value);
                    return;
                },
                status: (status: number) => {
                    return {
                        json: (value: any) => {
                            console.log(status), value;
                        },
                    };
                },
            } as any,
        ),
);

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMTdlM2VkYjBjNjVhMDgyNzg2YWFjM2FkZGE2NzFiNmVjNjIwM2JlOGU1YjMyZWU4ZDBiY2MzYTcwZTAyMzgwIiwiY3JlYXRlZEF0IjoiMjAyNS0wNC0wM1QyMjoxMTowMi45OThaIiwiaWF0IjoxNzQzNzE4MjYyLCJleHAiOjE3NDM4MDQ2NjJ9.MlYNfCOV6kf8X_vXpecG1nyPGEHV22QrqWQ9h3Ak35o
