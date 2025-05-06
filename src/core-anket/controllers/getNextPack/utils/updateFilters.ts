import { filters } from 'src/core-anket/utils/interfaces';
import { User } from '../../../../core-user/models/entities/User';
import { AppDataSource } from '../../../../shared/model';
import { calculate_distance, calculate_score } from '../../../utils/calculate';
import { filter_user } from '../../startDating/utils/filter';
import { dating_sessions } from '../../startDating/utils/sortAnkets';

export const update_filters = async (current_user: User, filters: filters) => {
    if (!dating_sessions.has(current_user.user_id)) {
        return { success: false, message: `Session doesn't exists` };
    }
    const ankets = dating_sessions.get(current_user.user_id);
    if (!ankets) {
        return { success: false, message: `Zero Ankets` };
    }

    const new_ankets: { user_id: string; score: number }[] = [];
    for (const anket_user_id of ankets) {
        const user = await AppDataSource.getRepository(User).findOne({
            where: { user_id: anket_user_id },
            relations: ['profile'],
        });
        if (!user) continue;
        if (!filter_user(current_user, user, filters)) continue;
        const distance = calculate_distance(current_user.geolocation, user.geolocation);
        const score = calculate_score(current_user, user, distance);

        new_ankets.push({ user_id: user.user_id, score: score });
    }
    if (!new_ankets) {
        return { success: false, message: `Zero Ankets After Sorting` };
    }
    new_ankets.sort((a, b) => b.score - a.score); // сортировка методом sort
    const sorted_user_ids: string[] = new_ankets.map((anket) => anket.user_id);
    dating_sessions.set(current_user.user_id, sorted_user_ids);
    return { success: true, message: 'Successfully sorted last ankets in session' };
};
