import { Response } from "express";
import { HTTP_STATUSES } from "../../../../shared/utils";
import { generateJWT, generateRefreshToken } from "../../../../shared/utils/generateJWT";

const create_tokens = (existing_auth: any, res: Response) => {
    const current_user_id = existing_auth.user.user_id;
    if (!current_user_id) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while fetching user_data by auth.',
            details: 'Error with auth relationship to user data',
        });
    }

    const access_token = generateJWT(current_user_id);
    const refresh_token = generateRefreshToken(current_user_id);

    if (!(access_token && refresh_token)) {
        return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
            message: 'Error occured while creating tokens.',
            details: 'Access or refresh token have not generated.',
        });
    }

    return [access_token, refresh_token];
}

export default create_tokens;
