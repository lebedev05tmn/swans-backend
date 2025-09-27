import { In, Not } from 'typeorm';

import { filters } from '../../../utils/interfaces';
import { premium_filter_check } from '../../../utils/premiumFilterCheck';
import { User } from '../../../../core-user/models/entities/User';
import { AppDataSource } from '../../../../shared/model';
import { filter_user } from './filter';
import { calculate_distance, calculate_score } from '../../../utils/calculate';

export const get_204 = async (current_user: User, filters?: filters) => {
    console.log('entry get_204 function');
    const viewedIds = Array.isArray(current_user.viewed_ankets_ids) ? current_user.viewed_ankets_ids : [];

    const all_users = await AppDataSource.getRepository(User).find({
        where: {
            user_id: Not(In(viewedIds.length ? viewedIds : ['EMPTY'])),
        },
        relations: ['profile'],
    });
    const ankets: { user_id: string; score: number }[] = [];
    let counter = 0;
    if (filters) {
        console.log('entry into filters block');
        if (!premium_filter_check(current_user, filters))
            throw new Error(`Only premium usesrs can use premium filters`);
        for (const user of all_users) {
            if (!filter_user(current_user, user, filters)) continue;
            const distance = calculate_distance(current_user.geolocation, user.geolocation);
            const score = calculate_score(current_user, user, distance);

            ankets.push({ user_id: user.user_id, score: score });
            counter = counter + 1;
            if (counter === 204) break;
        }
    } else {
        console.log('entry into non filters block');
        for (const user of all_users) {
            if (user.user_id == current_user.user_id) continue;
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
