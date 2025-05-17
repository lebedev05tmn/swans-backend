import { In, Not } from 'typeorm';

import { filters } from '../../../utils/interfaces';
import { premium_filter_check } from '../../../utils/premiumFilterCheck';
import { User } from '../../../../core-user/models/entities/User';
import { AppDataSource } from '../../../../shared/model';
import { filter_user } from './filter';
import { calculate_distance, calculate_score } from '../../../utils/calculate';

export const get_204 = async (current_user: User, filters?: filters) => {
    const all_users = await AppDataSource.getRepository(User).find({
        where: {
            user_id: Not(In(current_user.viewed_ankets_ids)),
        },
        relations: ['profile'],
    });
    const ankets: { user_id: string; score: number }[] = [];
    let counter = 0;
    if (filters) {
        for (const user of all_users) {
            if (!premium_filter_check(current_user, filters))
                throw new Error(`Only premium usesrs can contain premium filters`);
            if (!filter_user(current_user, user, filters)) continue;
            const distance = calculate_distance(current_user.geolocation, user.geolocation);
            const score = calculate_score(current_user, user, distance);

            ankets.push({ user_id: user.user_id, score: score });
            counter = counter + 1;
            if (counter === 204) break;
        }
    } else {
        for (const user of all_users) {
            const distance = calculate_distance(current_user.geolocation, user.geolocation);
            const score = calculate_score(current_user, user, distance);

            ankets.push({ user_id: user.user_id, score: score });
            counter = counter + 1;
            if (counter === 204) break;
        }
    }

    if (ankets.length) return ankets;
    else return undefined;
};
