import bcrypt from 'bcrypt-nodejs';

import { AuthServiceName } from '../../../../shared/utils';
import { Auth } from '../../../../core-auth/models/entities/Auth';
import { AppDataSource } from '../../../../shared/model';

export const find_auth = async (service_user_id: string, service_name: string): Promise<null | Auth> => {
    const authRepository = AppDataSource.getRepository(Auth);
    if (service_name == AuthServiceName.EMAIL) {
        const [email, password] = service_user_id.split(':');
        const password_hash = bcrypt.hashSync(password, process.env.BCRYPT_SALT);
        const email_hash = bcrypt.hashSync(email, process.env.BCRYPT_SALT);

        try {
            const existing_auth = await authRepository.findOne({
                where: {
                    service_name: service_name,
                    service_user_id: `${email_hash}:${password_hash}`,
                },
                relations: ['user'],
            });

            return existing_auth;
        } catch {
            return null;
        }
    } else {
        const service_id_hashed = bcrypt.hashSync(service_user_id, process.env.BCRYPT_SALT);
        console.log(service_id_hashed);

        try {
            const existing_auth = await authRepository.findOne({
                where: {
                    service_name: service_name,
                    service_user_id: service_id_hashed,
                },
                relations: ['user'],
            });

            return existing_auth;
        } catch {
            return null;
        }
    }
};
