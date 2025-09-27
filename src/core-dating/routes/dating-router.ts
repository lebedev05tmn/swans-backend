import express, { Request, Response } from 'express';

import server from '../../shared/utils/server';
import { evaluate_user } from '../controllers/evaluateUser/evaluateUser';
import { get_likes_list } from '../controllers/getLikesList/getLikesList';

export const datingRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Dating
 *     description: Работа с анкетами
 */

/**
 * @openapi
 * /api/dating/get_likes_list:
 *   get:
 *     summary: Получение списка лайкнувших
 *     security:
 *       - bearerAuth: []
 *     tags: [Dating]
 *     description: Поиск пользователя по базе данных и добавление в массив его авторизаций новой записи
 *     responses:
 *       200:
 *         description: Получение списка лайкнувших
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
datingRouter.get('/get_likes_list', async (req: Request, res: Response) => {
    get_likes_list(req, res);
});

/**
 * @openapi
 * /api/dating/evaluate_user:
 *   post:
 *     summary: Лайк или дизлайк пользователя
 *     security:
 *       - bearerAuth: []
 *     tags: [Dating]
 *     description: Добавление просмотренной анкеты или добавление данной анкеты в список лайкнувших
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evaluated_user_id:
 *                 type: string
 *                 description: Идентификатор пользователя, которого лайкаем
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               like:
 *                 type: boolean
 *                 description: Лайк или дизлайк
 *                 example: true
 *               is_super_like:
 *                 type: boolean
 *                 description: Суперлайк ли это (работает только с like == true)
 *                 example: false
 *             required:
 *               - evaluated_user_id
 *               - like
 *     responses:
 *       200:
 *         description: Корректная обработка запроса
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Operation completed successfully"
 *       400:
 *         description: Ошибка со стороны клиента. Проверьте запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters"
 *       404:
 *         description: Ошибка связанная с поиском пользователя в БД
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Ошибка со стороны сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 details:
 *                   type: string
 *                   description: Подробное описание ошибки на сервере
 *                   example: "Database connection failed"
 */
datingRouter.post('/evaluate_user', async (req: Request, res: Response) => {
    evaluate_user(req, res);
});

/**
 * @openapi
 * /api/dating/anket:
 *   post:
 *     summary: Обработка подбора анкет с использованием JSON-RPC
 *     tags: [Dating]
 *     description: |
 *       Этот эндпоинт обрабатывает подбор анкет с использованием JSON-RPC.
 *       Поддерживает два метода: `start_dating` и `get_next_pack`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DatingJsonRpcRequest"
 *     responses:
 *       200:
 *         description: Успешный ответ JSON-RPC
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: "#/components/schemas/StartDatingSuccessResponse"
 *                 - $ref: "#/components/schemas/GetNextPackSuccessResponse"
 *       400:
 *         description: Ошибка клиента. Неверные параметры или состояние сессии.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/JsonRpcErrorResponse"
 *       401:
 *         description: Ошибка авторизации. Неверный или отсутствующий токен.
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
 *     DatingJsonRpcRequest:
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
 *             - `start_dating` — начало подбора анкет с указанными фильтрами.
 *             - `get_next_pack` — получение следующего пакета анкет.
 *           enum: [start_dating, get_next_pack]
 *           example: "start_dating"
 *         params:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT токен авторизации
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             filters:
 *               type: object
 *               properties:
 *                 sex:
 *                   type: string
 *                   description: Пол для фильтрации
 *                   example: "female"
 *                 age:
 *                   type: array
 *                   items:
 *                     type: number
 *                   minItems: 2
 *                   maxItems: 2
 *                   description: Диапазон возраста [min, max]
 *                   example: [18, 30]
 *                 distance:
 *                   type: array
 *                   items:
 *                     type: number
 *                   minItems: 2
 *                   maxItems: 2
 *                   description: Диапазон расстояния в метрах [min, max]
 *                   example: [0, 5000]
 *                 premium:
 *                   type: boolean
 *                   description: Фильтр по премиум статусу
 *                   example: true
 *                 verificated:
 *                   type: boolean
 *                   description: Фильтр по верификации
 *                   example: true
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Массив категорий для фильтрации
 *                   example: ["sport", "music"]
 *               description: Фильтры для подбора анкет (опционально)
 *           required:
 *             - token
 *         id:
 *           type: string
 *           description: Уникальный идентификатор запроса
 *           example: "1"
 *       required:
 *         - jsonrpc
 *         - method
 *         - params
 *         - id
 *
 *     StartDatingSuccessResponse:
 *       type: object
 *       properties:
 *         jsonrpc:
 *           type: string
 *           example: "2.0"
 *         result:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Dating session started successfully"
 *         id:
 *           type: string
 *           example: "1"
 *
 *     GetNextPackSuccessResponse:
 *       type: object
 *       properties:
 *         jsonrpc:
 *           type: string
 *           example: "2.0"
 *         result:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Pack retrieved successfully"
 *             pack:
 *               type: array
 *               items:
 *                 type: object
 *               description: Массив анкет (опционально, если success=true)
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
 *               example: "Invalid parameters"
 *         id:
 *           type: string
 *           example: "1"
 */
datingRouter.post('/anket', async (req: Request, res: Response) => {
    const jsonRPCRequest = req.body;
    const response = await server.receive(jsonRPCRequest);
    if (response) {
        res.json(response);
    }
});
