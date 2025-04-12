import express from 'express';
import { Request, Response } from 'express';
import { chatPaginate } from '../controllers/rest/paginate';

export const chatRouter = express.Router();

// /**
//  * @openapi
//  * tags:
//  *   name: Chat
//  *   description: REST API для чата
//  */

// /**
//  * @openapi
//  * components:
//  *   schemas:
//  *     Message:
//  *       type: object
//  *       properties:
//  *         message_id:
//  *           type: integer
//  *         chat_id:
//  *           type: integer
//  *         sender_id:
//  *           type: string
//  *         recipient_id:
//  *           type: string
//  *         message_text:
//  *           type: string
//  *         sending_time:
//  *           type: string
//  *           format: date-time
//  *         is_readen:
//  *           type: boolean
//  *         images:
//  *           type: array
//  *           items:
//  *             type: string
//  *           nullable: true
//  *         response_to:
//  *           type: integer
//  *           nullable: true
//  *         reaction_sender:
//  *           type: string
//  *           nullable: true
//  *         reaction_recipient:
//  *           type: string
//  *           nullable: true
//  */

// /**
//  * @openapi
//  * /api/chat/paginate/{id}:
//  *   get:
//  *     summary: Получить сообщения чата с пагинацией
//  *     description: Возвращает список сообщений для указанного чата с поддержкой пагинации.
//  *     tags: [Chat]
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         required: true
//  *         description: ID чата
//  *         schema:
//  *           type: integer
//  *       - name: page
//  *         in: query
//  *         required: true
//  *         description: Номер страницы (начинается с 1)
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Успешный ответ
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 messages:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Message'
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     totalItems:
//  *                       type: integer
//  *                     itemsPerPage:
//  *                       type: integer
//  *                     currentPage:
//  *                       type: integer
//  *       500:
//  *         description: Внутренняя ошибка сервера
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  */

chatRouter.get('/paginate/:id', async (req: Request, res: Response) => {
    await chatPaginate(req, res);
});
