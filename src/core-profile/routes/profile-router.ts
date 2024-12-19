import express from 'express';
import { Request, Response } from 'express';
import { getAllProfiles } from '../controllers/get-all-profiles';
import { getProfileById } from '../controllers/get-profile-by-id';
import { createProfile } from '../controllers/create-profile';
import { updateProfile } from '../controllers/update-profile';
import { deleteProfile } from '../controllers/delete-profile';

export const profileRouter = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         user_id:
 *           type: number
 *         user_name:
 *           type: string
 *         birth_date:
 *           type: string
 *           format: date
 *         sex:
 *           type: boolean
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         short_desc:
 *           type: string
 *         long_desc:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *     NoUserIdProfile:
 *       type: object
 *       properties:
 *         user_name:
 *           type: string
 *         birth_date:
 *           type: string
 *           format: date
 *         sex:
 *           type: boolean
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         short_desc:
 *           type: string
 *         long_desc:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @openapi
 * tags:
 *   name: Profile
 *   description: Взаимодействие с базой данных профилей
 */

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Получить список всех существующих профилей
 *     tags: [Profile]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Profile'
 *                 length:
 *                   type: number
 *
 */
profileRouter.get('/', async (req: Request, res: Response) => {
    getAllProfiles(req, res);
});

/**
 * @openapi
 * /api/profile/get/{id}:
 *   get:
 *     summary: Получить профиль по id
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: id профиля
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
profileRouter.get('/get/:id', async (req: Request, res: Response) => {
    getProfileById(req, res);
});

/**
 * @openapi
 * /api/profile/create:
 *   post:
 *     summary: Создание нового пользователя
 *     tags: [Profile]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: number
 *         required: true
 *         description: id профиля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoUserIdProfile'
 *     responses:
 *       201:
 *         description: Профиль создан успешно
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Неверный формат входных данных
 *       500:
 *         description: Ошибка на стороне сервера
 */
profileRouter.post('/create', async (req: Request, res: Response) => {
    createProfile(req, res);
});

/**
 * @openapi
 * /api/profile/update:
 *   patch:
 *     summary: Обновление информации о пользователе
 *     tags: [Profile]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: id профиля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoUserIdProfile'
 *     responses:
 *       200:
 *         description: Профиль обновлен успешно
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Профиль под введенным id не найден
 *       500:
 *         description: Ошибка на стороне сервера
 */
profileRouter.patch('/update', async (req: Request, res: Response) => {
    updateProfile(req, res);
});

/**
 * @openapi
 * /api/profile/delete/{id}:
 *   delete:
 *     summary: Удалить профиль по id
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: id профиля
 *     responses:
 *       204:
 *         description: Профиль удален успешно
 *       404:
 *         description: Профиль не найден
 *       500:
 *         description: Ошибка на стороне сервера
 */
profileRouter.delete('/delete/:id', async (req: Request, res: Response) => {
    deleteProfile(req, res);
});
