import express from 'express';
import { HTTP_STATUSES } from '../../shared/utils';
import { pool } from '../database';

export const userRouter = express.Router();

userRouter.get('/:id', async (req, res) => {
    const user = await pool.query(`SELECT * FROM person WHERE user_id = $1`, [
        Number(req.params.id),
    ]);

    const row = user.rows[0];
    const date = new Date(row.birth_date);
    row.birth_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    res.json(row);
});

userRouter.post('/', async (req, res) => {
    const {
        user_name,
        birth_date,
        sex,
        images,
        short_desc,
        long_desc,
        categories,
    } = req.body;

    const newUser = await pool.query(
        `
        INSERT INTO person (user_id, user_name, birth_date, sex, images, short_desc, long_desc, categories)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `,
        [
            Number(req.query.id),
            user_name,
            birth_date,
            sex,
            JSON.stringify(images),
            short_desc,
            long_desc,
            JSON.stringify(categories),
        ],
    );

    const row = newUser.rows[0];
    const date = new Date(row.birth_date);
    row.birth_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    res.json(row);
});

userRouter.put('/', async (req, res) => {
    const {
        user_name,
        birth_date,
        sex,
        images,
        short_desc,
        long_desc,
        categories,
    } = req.body;
    const id = Number(req.query.id);

    let values = [];
    let setClause = '';
    let i = 1;

    if (user_name) {
        setClause += `user_name = $${i}, `;
        i++;
        values.push(user_name);
    }
    if (birth_date) {
        setClause += `birth_date = $${i}, `;
        i++;
        values.push(birth_date);
    }
    if (sex) {
        setClause += `sex = $${i}, `;
        i++;
        values.push(sex);
    }
    if (images) {
        setClause += `images = $${i}, `;
        i++;
        values.push(JSON.stringify(images));
    }
    if (short_desc) {
        setClause += `short_desc = $${i}, `;
        i++;
        values.push(short_desc);
    }
    if (long_desc) {
        setClause += `long_desc = $${i}, `;
        i++;
        values.push(long_desc);
    }
    if (categories) {
        setClause += `categories = $${i}, `;
        i++;
        values.push(JSON.stringify(categories));
    }

    values.push(id);
    setClause = setClause.slice(0, -2);

    const query = `
        UPDATE person
        SET ${setClause}
        WHERE user_id = $${i}
        RETURNING *
    `;

    const user = await pool.query(query, values);

    const row = user.rows[0];
    const date = new Date(row.birth_date);
    row.birth_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    res.json(row);
});

userRouter.delete('/:id', async (req, res) => {
    await pool.query(`DELETE FROM person WHERE user_id = $1`, [
        Number(req.params.id),
    ]);
    res.sendStatus(HTTP_STATUSES.OK_200);
});
