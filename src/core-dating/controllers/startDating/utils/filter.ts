import { filters } from '../../../utils/interfaces';
import { User } from '../../../../core-user/models/entities/User';
import { calculate_distance, get_full_age } from '../../../utils/calculate';

export const filter_user = (current_user: User, user: User, filters: filters): boolean => {
    if (user.user_id === current_user.user_id) return false;

    if (filters?.sex && filters.sex != user.profile.sex) return false;

    const user_age = get_full_age(user.profile.birth_date);
    if (filters?.age && (filters.age[0] > user_age || user_age > filters.age[1])) {
        return false;
    }

    const distance = calculate_distance(current_user.geolocation, user.geolocation);
    if (filters?.distance && (filters.distance[0] > distance || distance > filters.distance[1])) {
        return false;
    }

    if (current_user.premium) {
        if (filters?.premium != user.premium) return false;
        if (filters.verificated != user.verify) return false;
        if (filters.categories) {
            let counter: number = 0;
            for (let category_search of filters.categories) {
                for (let category_user of user.profile.categories) {
                    if (category_search === category_user) {
                        counter = counter + 1;
                        break;
                    }
                }
            }
            if (counter !== filters.categories.length) return false;
        }
    }
    return true;
};
