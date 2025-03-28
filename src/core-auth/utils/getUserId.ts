import { Request } from 'express';
import jwt from 'jsonwebtoken';
import jwtConfig from '../../shared/config/JWTConfig';

export default (req: Request): string => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new Error('Missing or invalid Authorization header!');

    const token = authHeader.split(' ')[1];

    let decodedToken: any;
    try {
        decodedToken = jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        throw new Error('Invalid or expired token!');
    }

    const user_id = decodedToken.userId;

    if (!user_id) throw new Error('User not Found in Token Payload!');

    return user_id;
};
