import { AppDataSource } from '../../../../shared/model';
import { filters } from '../../../utils/interfaces';
import { User } from '../../../../core-user/models/entities/User';
import { get_204 } from './get204';

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

        return { success: false, message: `Session for user already exists!` };
    }

    try {
        const ankets = await get_204(current_user, filters);
        if (!ankets?.length) return { success: false, message: `Zero ankets!` };

        ankets.sort((a, b) => b.score - a.score); // сортировка методом sort
        let sorted_user_ids: string[] = ankets.map((anket) => anket.user_id);
        sorted_user_ids = sorted_user_ids.filter(
            (user_id) => !current_user.likes_list.find((liked) => liked.user_id === user_id),
        ); // сортировка для фильтрации анкет, которые находятся в likes_list
        dating_sessions.set(current_user.user_id, sorted_user_ids);

        current_user.dating_last_time = new Date();
        await AppDataSource.getRepository(User).save(current_user);
        return { success: true, message: 'Session created' };
    } catch (error) {
        return { success: false, message: String(error) };
    }
};
