import { Request, Response } from "express";
import { HTTP_STATUSES } from "../../../../shared/utils";
import jwtConfig from "../../../../shared/config/JWTConfig";
import jwt from 'jsonwebtoken';

const get_user_id = (req: Request, res: Response) => {
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
    if (!user_id) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Invalid token payload!',
        });
    }

    return user_id;
}

export default get_user_id;
