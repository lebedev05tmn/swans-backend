import {
    generateJWT,
    generateRefreshToken,
} from '../../shared/utils/generateJWT';
import generateUniqueId from './generateUniqueId';

export const get_user_id_and_tokens = (
    service_id: string,
    service_name: string,
) => {
    const user_id = generateUniqueId(service_id, service_name);
    const access_token = generateJWT(user_id);
    const refresh_token = generateRefreshToken(user_id);

    return [user_id, access_token, refresh_token] as const;
};
