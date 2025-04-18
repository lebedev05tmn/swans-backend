import express from 'express';
import { Request, Response } from 'express';
import { chatPaginate } from '../controllers/rest/paginate';
import { getAllChats } from '../controllers/rest/get-all-chats';

export const chatRouter = express.Router();

/**
 * @openapi
 * tags:
 *   name: Chat
 *   description: REST API для чата
 *
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         message_id:
 *           type: integer
 *         chat_id:
 *           type: integer
 *         sender_id:
 *           type: string
 *         recipient_id:
 *           type: string
 *         message_text:
 *           type: string
 *         sending_time:
 *           type: string
 *           format: date-time
 *         is_readen:
 *           type: boolean
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         response_to:
 *           type: integer
 *           nullable: true
 *         reaction_sender:
 *           type: string
 *           nullable: true
 *         reaction_recipient:
 *           type: string
 *           nullable: true
 *
 *     ChatMetadata:
 *       type: object
 *       properties:
 *         chat_id:
 *           type: integer
 *         user_id:
 *           type: string
 *         name:
 *           type: string
 *         age:
 *           type: integer
 *         profile_picture:
 *           type: string
 *         online:
 *           type: boolean
 *         verify:
 *           type: boolean
 *         unread_count:
 *           type: integer
 *         last_message_text:
 *           type: string
 *         last_message_time:
 *           type: string
 *           format: date-time
 *         locale:
 *           type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         type: object
 *         properties:
 *           message:
 *             type: string
 *           details:
 *             type: string
 */

/**
 * @openapi
 * /api/chat/paginate/{id}:
 *   get:
 *     summary: Получить сообщения чата с пагинацией
 *     description: Возвращает список сообщений для указанного чата с поддержкой пагинации
 *     security:
 *       - bearerAuth: []
 *     tags: [Chat]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID чата
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Количество сообщений на странице
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Смещение пагинации
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     currentOffset:
 *                       type: integer
 *                     locale:
 *                       type: string
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

chatRouter.get('/paginate/:id', async (req: Request, res: Response) => {
    await chatPaginate(req, res);
});

/**
 * @openapi
 * /api/chat/all-chats:
 *   get:
 *     summary: Получить список всех чатов пользователя
 *     description: Возвращает список чатов с последними сообщениями и метаданными
 *     security:
 *       - bearerAuth: []
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMetadata'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

chatRouter.get('/all-chats', async (req: Request, res: Response) => {
    await getAllChats(req, res);
});
