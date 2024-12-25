import jwt from 'jsonwebtoken';

import jwtConfig from '../config/JWTConfig';


function generateJWT(user_id: string): string {
    /* Создание JWT на основе user_id */

    const payload = {
        userId: user_id,
        createdAt: new Date().toISOString()
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
        algorithm: jwtConfig.algorithm as jwt.Algorithm
    });

    return token;
}

function generateRefreshToken(user_id: string): string {
    const payload = {
        userId: user_id,
        type: "refresh",
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.refreshExpiresIn,
        algorithm: jwtConfig.algorithm as jwt.Algorithm,
    });

    return token;
}

export { generateJWT, generateRefreshToken };
