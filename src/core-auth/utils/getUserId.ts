import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../../shared/config/JWTConfig';
import { HTTP_STATUSES } from '../../shared/utils';

export default (req: Request, res: Response): string | Response => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Missing or invalid Authorization header!',
        });

    const token = authHeader.split(' ')[1];

    let decodedToken: JwtPayload;
    try {
        decodedToken = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Invalid or expired token!',
        });
    }

    const user_id = decodedToken.userId;

    if (!user_id) {
        return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: 'User not Found in Token Payload!',
        });
    }

    return user_id;
};
