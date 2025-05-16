import { User } from '../../core-user/models/entities/User';
import { filters } from './interfaces';

export const premium_filter_check = (current_user: User, filter: filters) => {
    if (current_user.premium) return true;

    if (filter.premium || filter.verificated || filter.categories) return false;
};
