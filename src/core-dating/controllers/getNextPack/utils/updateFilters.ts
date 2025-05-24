import { filters } from '../../../utils/interfaces';
import { User } from '../../../../core-user/models/entities/User';
import { dating_sessions } from '../../startDating/utils/sortAnkets';
import { update_session } from './updateSession';
import { get_204 } from '../../startDating/utils/get204';

export const update_filters = async (current_user: User, filters: filters) => {
    if (!dating_sessions.has(current_user.user_id)) {
        return { success: false, message: `Session doesn't exists` };
    }
    const ankets = dating_sessions.get(current_user.user_id);
    if (!ankets?.length) {
        update_session(current_user, filters);
        if (!dating_sessions.get(current_user.user_id)?.length) {
            dating_sessions.delete(current_user.user_id);
            return { success: false, message: `Zero ankets` };
        }
    }

    const new_ankets = await get_204(current_user, filters);
    if (!new_ankets?.length) return { success: false, message: `Zero ankets!` };

    new_ankets.sort((a, b) => b.score - a.score); // сортировка методом sort
    const sorted_user_ids: string[] = new_ankets.map((anket) => anket.user_id);
    dating_sessions.set(current_user.user_id, sorted_user_ids);
    return { success: true, message: 'Successfully sorted last ankets in session' };
};
