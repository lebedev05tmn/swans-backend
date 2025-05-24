import { AppDataSource } from '../../../shared/model';
import { datingParams } from '../../utils/interfaces';
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
    try {
        const current_user = await AppDataSource.getRepository(User).findOneOrFail({
            where: { user_id: user_id },
        });

        if (params.filters) {
            const filter_result = await update_filters(current_user, params.filters);
            if (!filter_result?.success) return filter_result;
        }

        const result = get_next_pack_process(current_user);
        return result;
    } catch (error) {
        return { success: false, message: String(error), pack: undefined };
    }
};
