import { Request, Response } from "express";

import { User } from "../models/entities/User";
import { AppDataSource } from "../../shared/model";
import { HTTP_STATUSES } from "../../shared/utils/index";


async function getUserAuthData(req: Request, res: Response) {
    try {
        const userId: string = req.params.id;

        const userRepository = AppDataSource.getRepository(User);
        const currentUser = await userRepository.findOne({
            where: { user_id: userId },
            relations: ["resources"]
        });

        if (currentUser) {
            res.status(HTTP_STATUSES.OK_200).json({
                userId: userId,
                resources: currentUser.resources.map((auth) => ({
                    authId: auth.auth_id,
                    serviceUserId: auth.service_user_id,
                    serviceName: auth.service_name
                })),
            });
        } else {
            res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                message: `User with id: ${userId} dosen't exists!`
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error occured while trying to fetch user auth data",
            details: error
        });
    }
    
}

export default getUserAuthData;
