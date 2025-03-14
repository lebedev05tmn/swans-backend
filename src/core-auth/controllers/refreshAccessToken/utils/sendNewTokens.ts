import { Response } from "express";
import { AppDataSource } from "../../../../shared/model";
import { User } from "../../../../core-user/models/entities/User";
import { HTTP_STATUSES } from "../../../../shared/utils";
import { generateJWT, generateRefreshToken } from "../../../../shared/utils/generateJWT";

const send_new_tokens = async (user_id: string, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOne({
        where: { user_id: user_id },
    });

    if (!currentUser) {
        return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: 'User not found!',
        });
    }

    const newAccessToken = generateJWT(user_id);
    const newRefreshToken = generateRefreshToken(user_id);

    currentUser.refresh_token = newRefreshToken;
    await userRepository.save(currentUser);

    return res.status(HTTP_STATUSES.OK_200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    });
}

export default send_new_tokens;
