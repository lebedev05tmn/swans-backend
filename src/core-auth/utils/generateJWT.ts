import jwt from 'jsonwebtoken';

import jwtConfig from '../../shared/config/JWTConfig';


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

export default generateJWT;
