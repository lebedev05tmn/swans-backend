import express from 'express';
import { Request, Response } from 'express';
// import { getAllProfiles } from '../controllers/get-all-profiles';
// import { getProfileById } from '../controllers/get-profile-by-id';
// import { updateProfile } from '../controllers/update-profile';
// import { createProfile } from '../controllers/create-profile';

export const profileRouter = express.Router();

// /**
//  * @openapi
//  * tags:
//  *   name: Profile
//  *   description: Взаимодействие с базой данных профилей
//  */

// /**
//  * @openapi
//  * components:
//  *   schemas:
//  *     Profile:
//  *       type: object
//  *       properties:
//  *         user_name:
//  *           type: string
//  *         birth_date:
//  *           type: string
//  *           format: date
//  *         sex:
//  *           type: string
//  *         images:
//  *           type: array
//  *           items:
//  *             type: string
//  *         description:
//  *           type: string
//  *         categories:
//  *           type: array
//  *           items:
//  *             type: string
//  *         city:
//  *           type: string
//  *     NoUserIdProfile:
//  *       type: object
//  *       properties:
//  *         user_name:
//  *           type: string
//  *         birth_date:
//  *           type: string
//  *           format: date
//  *         sex:
//  *           type: string
//  *         images:
//  *           type: array
//  *           items:
//  *             type: string
//  *         description:
//  *           type: string
//  *         categories:
//  *           type: array
//  *           items:
//  *             type: string
//  *         city:
//  *           type: string
//  *       example:
//  *         user_name: Александр Ясюкевич
//  *         birth_date: 1996-04-17
//  *         sex: male
//  *         images: [firstimage, secondimage]
//  *         description: Описание пользователя, которое он придумал себе сам.
//  *         categories: [category1, category2, category3]
//  *         city: Москва
//  */

// /**
//  * @openapi
//  * /api/profile:
//  *   get:
//  *     summary: Получить список всех существующих профилей
//  *     tags: [Profile]
//  *     responses:
//  *       200:
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 list:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Profile'
//  *                 length:
//  *                   type: number
//  *
//  */
// profileRouter.get('/', async (req: Request, res: Response) => {
//     getAllProfiles(req, res);
// });

// /**
//  * @openapi
//  * /api/profile/get:
//  *   get:
//  *     summary: Получить профиль по id
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Успешный ответ
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Profile'
//  *       404:
//  *         description: Профиль не найден
//  *       500:
//  *         description: Ошибка на стороне сервера
//  */
// profileRouter.get('/get', async (req: Request, res: Response) => {
//     getProfileById(req, res);
// });

// /**
//  * @openapi
//  * /api/profile/create:
//  *   post:
//  *     summary: Создание нового пользователя
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/NoUserIdProfile'
//  *     responses:
//  *       201:
//  *         description: Профиль создан успешно
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Profile'
//  *       400:
//  *         description: Неверный формат входных данных
//  *       500:
//  *         description: Ошибка на стороне сервера
//  */
// profileRouter.post('/create', async (req: Request, res: Response) => {
//     createProfile(req, res);
// });

// /**
//  * @openapi
//  * /api/profile/update:
//  *   patch:
//  *     summary: Обновление информации о пользователе
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/NoUserIdProfile'
//  *     responses:
//  *       200:
//  *         description: Профиль обновлен успешно
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Profile'
//  *       404:
//  *         description: Профиль под введенным id не найден
//  *       500:
//  *         description: Ошибка на стороне сервера
//  */
// profileRouter.patch('/update', async (req: Request, res: Response) => {
//     updateProfile(req, res);
// });
