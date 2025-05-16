import { In } from 'typeorm';

import { User } from '../../../../core-user/models/entities/User';
import { calculate_distance, calculate_similarity, get_full_age } from '../../../utils/calculate';
import { AppDataSource } from '../../../../shared/model';

export const serialize_pack = async (user_ids: string[], current_user: User) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pack_data: any[] = [];
    const search_users = await AppDataSource.getRepository(User).find({
        where: {
            user_id: In(user_ids),
        },
        relations: ['profile'],
    });
    if (!search_users.length) return undefined;
    search_users.forEach((search_user) => {
        let distance_between: number = calculate_distance(current_user.geolocation, search_user.geolocation);
        const age: number = get_full_age(search_user.profile.birth_date);

        if (!distance_between || !age) {
            return undefined;
        }
        if (distance_between < 100) distance_between = 0;
        const user_profile_data = {
            user_id: search_user.user_id,
            anket_name: search_user.profile.user_name,
            distance: distance_between,
            age: age,
            images: search_user.profile.images,
            verified: search_user.verify,
            premium: search_user.premium,
            descritpion: search_user.profile.description,
            categories_similarity: calculate_similarity(current_user, search_user),
        };
        pack_data.push(user_profile_data);
    });

    return pack_data;
};
