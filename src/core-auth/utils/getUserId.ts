import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../../shared/config/JWTConfig';
import { HTTP_STATUSES } from '../../shared/utils';

export const decodeUserId = (authHeader?: string) => {
    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new Error('Missing or invalid Authorization header!', {
            cause: HTTP_STATUSES.UNAUTHORIZED_401,
        });

    const token = authHeader.split(' ')[1];

    const decodedToken: JwtPayload | string = jwt.verify(
        token,
        jwtConfig.secret,
    );

    if (typeof decodedToken === 'object' && decodedToken.userId)
        return decodedToken.userId;

    throw new Error('Invalid or expired token!', {
        cause: HTTP_STATUSES.BAD_REQUEST_400,
    });
};

export default (req: Request<any>, res: Response): string | Response => {
    const authHeader = req.headers.authorization;

    let user_id;

    try {
        user_id = decodeUserId(authHeader);
    } catch (error) {
        if (error instanceof Error && error.message && error.cause) {
            return res.status(error.cause as number).json({
                message: error.message,
            });
        } else {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: 'Not found',
            });
        }
    }

    if (!user_id) {
        return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: 'User not Found in Token Payload!',
        });
    }

    return user_id;
};
