import { AppDataSource } from '../../../shared/model';
import { datingParams } from '../../../core-anket/utils/interfaces';
import { get_user_id } from '../startDating/utils/getUserId';
import { User } from '../../../core-user/models/entities/User';
import { get_next_pack_process } from './utils/getNextProcess';
import { update_filters } from './utils/updateFilters';

export const get_next_pack = async (params: datingParams) => {
    if (!params.token) {
        return { status: false, message: 'Missed token!' };
    }

    const user_id = get_user_id(params.token);
    if (!user_id) {
        return { status: false, message: 'Invalid or expired token!' };
    }

    const current_user = await AppDataSource.getRepository(User).findOne({
        where: { user_id: user_id },
        // relations: ['profile'],
    });
    if (!current_user) {
        return { status: false, message: `User with ${user_id} doesn't exists!` };
    }

    if (params.filters) {
        const filter_result = await update_filters(current_user, params.filters);
        if (!filter_result?.success) return filter_result;
    }

    const result = get_next_pack_process(current_user);
    return result;
};
