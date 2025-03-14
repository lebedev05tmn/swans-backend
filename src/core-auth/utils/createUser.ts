import { Auth } from "../models/entities/Auth";
import { User } from "../../core-user/models/entities/User";
import { AppDataSource } from "../../shared/model";

const create_user = async (auth_info: any) => {
    
    const [user_id, refresh_token, service_id, service_name] = auth_info;

    const userRepository = AppDataSource.getRepository(User);
    
    const newUser = new User();
    newUser.user_id = user_id;
    newUser.refresh_token = refresh_token;

    const newAuth = new Auth();
    newAuth.service_user_id = service_id;
    newAuth.service_name = service_name;

    // Установка связи oneToMany в User
    newUser.resources = [newAuth];

    // Сохранение пользователя и его авторизацию в БД
    await userRepository.save(newUser);
}

export default create_user;