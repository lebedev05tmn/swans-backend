import { Algorithm } from 'jsonwebtoken';

interface JWTConfig {
    secret: string;
    expiresIn: string | number;
    refreshExpiresIn: string | number;
    algorithm: Algorithm;
}

export interface JWTPayload {
    userId: string;
    createdAt: string;
}

export interface RefreshTokenPayload {
    userId: string;
    type: 'refresh';
}

const jwtConfig: JWTConfig = {
    secret: process.env.JWT_SECRET || 'standart_secret',
    expiresIn: process.env.JWT_EXPIRES || '1h',
    refreshExpiresIn: process.env.REFRESH_EXPIRES || '7d',
    algorithm: (process.env.JWT_ALGORITHM as Algorithm) || 'HS256',
};

export default jwtConfig;
