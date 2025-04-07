import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import jwtConfig from '../../shared/config/JWTConfig';
import { User } from '../../core-user/models/entities/User';
import { AppDataSource } from '../../shared/model';
import { HTTP_STATUSES } from '../../shared/utils';
import { generateJWT, generateRefreshToken } from '../../shared/utils/generateJWT';

async function refreshAccessToken(req: Request, res: Response) {
    try {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                message: 'Missing refresh token!',
            });
        }

        let decodedToken: JwtPayload;
        try {
            decodedToken = jwt.verify(refreshToken, jwtConfig.secret) as JwtPayload;
        } catch (error) {
            return res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                message: 'Invalid or expired refresh token!',
            });
        }

        const userId = decodedToken.userId;

        const userRepository = AppDataSource.getRepository(User);
        const currentUser = await userRepository.findOne({
            where: { user_id: userId },
        });

        if (!currentUser) {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: 'User not found!',
            });
        }

        const newAccessToken = generateJWT(userId);
        const newRefreshToken = generateRefreshToken(userId);

        currentUser.refresh_token = newRefreshToken;
        await userRepository.save(currentUser);

        return res.status(HTTP_STATUSES.OK_200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while refreshing token.',
            details: error,
        });
    }
}

export default refreshAccessToken;
