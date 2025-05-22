import jwt, { JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../../../../shared/config/JWTConfig';

export const get_user_id = (token: string): string => {
    let decodedToken: JwtPayload;
    try {
        decodedToken = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch {
        return '';
    }

    if (decodedToken.userId) {
        return decodedToken.userId;
    } else {
        return '';
    }
};
