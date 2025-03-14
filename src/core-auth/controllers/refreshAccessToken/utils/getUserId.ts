import { Request, Response } from "express";
import { HTTP_STATUSES } from "../../../../shared/utils";
import jwtConfig from "../../../../shared/config/JWTConfig";
import jwt from 'jsonwebtoken';

const get_user_id = (req: Request, res: Response) => {
    const refresh_token = req.body.refreshToken;

    if (!refresh_token) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Missing refresh token!',
        });
    }

    let decodedToken: any;
    try {
        decodedToken = jwt.verify(refresh_token, jwtConfig.secret);
    } catch (error) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
            message: 'Invalid or expired refresh token!',
        });
    }

    return decodedToken.userId;
}

export default get_user_id;
