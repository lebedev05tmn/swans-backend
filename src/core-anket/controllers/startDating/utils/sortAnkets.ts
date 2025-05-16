import { AppDataSource } from '../../../../shared/model';
import { filters } from '../../../utils/interfaces';
import { User } from '../../../../core-user/models/entities/User';
import { calculate_distance, calculate_score } from '../../../utils/calculate';
import { filter_user } from './filter';
import { premium_filter_check } from '../../../../core-anket/utils/premiumFilterCheck';

export const dating_sessions: Map<string, string[]> = new Map();

export const create_dating_session = async (
    current_user: User,
    filters?: filters,
): Promise<{ success: boolean; message: string }> => {
    if (dating_sessions.has(current_user.user_id)) {
        if (current_user.dating_last_time) {
            const current_date = new Date();
            const hour_diff: number =
                Math.abs(current_date.getTime() - current_user.dating_last_time.getTime()) / (1000 * 60 * 60);
            if (hour_diff > 3) {
                dating_sessions.delete(current_user.user_id);
            }
        }

        return { success: false, message: `Session for user didn't expire!` };
    }

    const all_users = await AppDataSource.getRepository(User).find({ relations: ['profile'] });
    const ankets: { user_id: string; score: number }[] = [];
    if (filters) {
        for (const user of all_users) {
            if (!premium_filter_check(current_user, filters))
                return { success: false, message: `Premium functions only avaliable to premium user` };
            if (!filter_user(current_user, user, filters)) continue;
            const distance = calculate_distance(current_user.geolocation, user.geolocation);
            const score = calculate_score(current_user, user, distance);

            ankets.push({ user_id: user.user_id, score: score });
        }
    }
    for (const user of all_users) {
        const distance = calculate_distance(current_user.geolocation, user.geolocation);
        const score = calculate_score(current_user, user, distance);

        ankets.push({ user_id: user.user_id, score: score });
    }

    if (!ankets) {
        return { success: false, message: 'Zero ankets' };
    }

    ankets.sort((a, b) => b.score - a.score); // сортировка методом sort
    let sorted_user_ids: string[] = ankets.map((anket) => anket.user_id);
    sorted_user_ids = sorted_user_ids.filter(
        (user_id) => !current_user.likes_list.find((liked) => liked.user_id === user_id),
    ); // сортировка для фильтрации анкет, которые находятся в likes_list
    dating_sessions.set(current_user.user_id, sorted_user_ids);

    current_user.dating_last_time = new Date();
    await AppDataSource.getRepository(User).save(current_user);
    return { success: true, message: 'Session created' };
};
