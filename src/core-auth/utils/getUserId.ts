import { Request, Response } from 'express';
import { HTTP_STATUSES } from '../../../src/shared/utils';
import jwt from 'jsonwebtoken';
import jwtConfig from '../../shared/config/JWTConfig';

export default (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Missing or invalid Authorization header!',
        });
    }

    const token = authHeader.split(' ')[1];

    let decodedToken: any;
    try {
        decodedToken = jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Invalid or expired token!',
        });
    }

    const user_id = decodedToken.userId;

    if (!user_id)
        res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: 'User not Found!',
        });

    return user_id;
};

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjODM1ZDlmMjZmMGQzNmUyNjc4ODE4N2NiZDExOGFkMWMwMTA1NzU0Yjk2YmY0M2NiYWMxZjUzMDliZTNjNzk1IiwiY3JlYXRlZEF0IjoiMjAyNS0wMy0yNFQyMToyNToyNS4wODFaIiwiaWF0IjoxNzQyODUxNTI1LCJleHAiOjE3NDI5Mzc5MjV9.sulnwQaMCFxCMg10TV-U5N5CoEnqzjCMSxpQl8PWHck
