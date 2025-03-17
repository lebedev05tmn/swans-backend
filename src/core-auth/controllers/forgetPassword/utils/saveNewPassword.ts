import { Auth } from "../../../../core-auth/models/entities/Auth";
import { AppDataSource } from "../../../../shared/model";
import { Like } from "typeorm";
import { v4 } from "uuid";
import bcrypt from 'bcrypt';
import { HTTP_STATUSES } from "../../../../shared/utils";

const save_new_password = async (data: any) => {

    const [email, res] = data;

    const authRepository = AppDataSource.getRepository(Auth);

    const current_auth = await authRepository.findOne({
        where: { service_user_id: Like(`${email}:%`) },
    });

    const new_password = v4().slice(0, 12);
    const new_password_hash = await bcrypt.hash(new_password, 10);

    if (current_auth) {
        const authRepository = AppDataSource.getRepository(Auth);
        current_auth.service_user_id = [email, new_password_hash].join(':');
        await authRepository.save(current_auth);
    } else {
        return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
            message: `User with '${email}' email doesn't exists.`,
        });
    }

    return new_password;
}

export default save_new_password;
