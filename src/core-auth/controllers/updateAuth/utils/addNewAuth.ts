import { Response } from "express";
import { Auth } from "../../../../core-auth/models/entities/Auth";
import { User } from "../../../../core-user/models/entities/User";
import { HTTP_STATUSES } from "../../../../shared/utils";

const add_new_auth = async (service_id: string, service_name: string, current_user: User, userRepo: any, res: Response) => {
    const new_auth_data = new Auth();
    new_auth_data.service_user_id = service_id;
    new_auth_data.service_name = service_name;

    let is_auth_correct = true;
    current_user.resources.forEach((auth) => {
        if (auth.service_name == service_name) {
            is_auth_correct = false;
        }
    });

    if (!is_auth_correct) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Trying to add same authType for the existing ones!',
        });
    }

    current_user.resources.push(new_auth_data);

    await userRepo.save(current_user);

    return res.status(HTTP_STATUSES.OK_200).json({
        message: `Successfully added new Auth for user with '${current_user.user_id}' id.`,
    });
}

export default add_new_auth;
