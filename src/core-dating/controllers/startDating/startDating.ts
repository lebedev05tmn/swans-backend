import { AppDataSource } from '../../../shared/model';
import { get_user_id } from './utils/getUserId';
import { User } from '../../../core-user/models/entities/User';
import { datingParams } from '../../utils/interfaces';
import { create_dating_session, dating_sessions } from './utils/sortAnkets';

export const start_dating = async (params: datingParams) => {
    console.time('start_dating');
    if (!params.token) {
        return { status: false, message: 'Missed token!' };
    }

    const user_id = get_user_id(params.token);
    if (!user_id) {
        return { status: false, message: 'Invalid or expired token!' };
    }

    const current_user = await AppDataSource.getRepository(User).findOne({
        where: { user_id: user_id },
        relations: ['profile'],
    });
    if (!current_user) {
        return { status: false, message: `User with ${user_id} doesn't exists!` };
    }

    const result = await create_dating_session(current_user, params.filters);
    console.timeEnd('start_dating');

    console.log(dating_sessions);
    return result;
};
