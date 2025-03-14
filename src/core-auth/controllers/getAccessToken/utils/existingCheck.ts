import { Response } from "express";
import { AppDataSource } from "../../../../shared/model";
import { Auth } from "../../../../core-auth/models/entities/Auth";
import { HTTP_STATUSES } from "../../../../shared/utils";

const existing_check = async (service_user_id: string, service_name: string, res: Response) => {
    const authRepository = AppDataSource.getRepository(Auth);
        const existing_auth = await authRepository.findOne({
            where: {
                service_name: service_name,
                service_user_id: service_user_id,
            },
            relations: ['user'],
        });

        if (!existing_auth) {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: `User with '${service_name}' service name and '${service_user_id}' service_user_id doesn't exists.`,
            });
        }

        return existing_auth;
};

export default existing_check;
