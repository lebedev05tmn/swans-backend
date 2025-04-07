import jwt from 'jsonwebtoken';

import jwtConfig, { JWTPayload, RefreshTokenPayload } from '../config/JWTConfig';

const generateJWT = (user_id: string): string => {
    const payload: JWTPayload = {
        userId: user_id,
        createdAt: new Date().toISOString(),
    };

    const options = {
        expiresIn: jwtConfig.expiresIn,
        algorithm: jwtConfig.algorithm,
    };

    const token = jwt.sign(payload, jwtConfig.secret, options);

    return token;
};

const generateRefreshToken = (user_id: string): string => {
    const payload: RefreshTokenPayload = {
        userId: user_id,
        type: 'refresh',
    };

    const options = {
        expiresIn: jwtConfig.refreshExpiresIn,
        algorithm: jwtConfig.algorithm,
    };

    const token = jwt.sign(payload, jwtConfig.secret, options);

    return token;
};

export { generateJWT, generateRefreshToken };
