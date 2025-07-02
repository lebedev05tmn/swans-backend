import { filters } from '../../../utils/interfaces';
import { User } from '../../../../core-user/models/entities/User';
import { get_204 } from '../../startDating/utils/get204';
import { dating_sessions } from '../../startDating/utils/sortAnkets';

export const update_session = async (current_user: User, filters?: filters) => {
    const ankets = await get_204(current_user, filters);
    if (!ankets) return { success: false, message: `Zero ankets!` };

    ankets.sort((a, b) => b.score - a.score); // сортировка методом sort
    let sorted_user_ids: string[] = ankets.map((anket) => anket.user_id);
    sorted_user_ids = sorted_user_ids.filter(
        (user_id) => !current_user.likes_list.find((liked) => liked.user_id === user_id),
    ); // сортировка для фильтрации анкет, которые находятся в likes_list
    dating_sessions.set(current_user.user_id, sorted_user_ids);
};
