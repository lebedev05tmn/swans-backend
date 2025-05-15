import { Response } from 'express';
import { User } from '../../../../core-user/models/entities/User';
import { calculate_distance, get_full_age } from 'src/core-anket/utils/calculate';
import { HTTP_STATUSES } from '../../../../shared/utils';

export const make_response = (current_user: User, search_users: User[], res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response_data: any[] = [];
    search_users.forEach((search_user) => {
        let distance_between: number = calculate_distance(current_user.geolocation, search_user.geolocation);
        const age: number = get_full_age(search_user.profile.birth_date);

        if (!distance_between || !age) {
            return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                message: 'Error occured while calculating the data',
            });
        }
        if (distance_between < 100) distance_between = 0;
        const user_profile_data = {
            anket_name: search_user.profile.user_name,
            distance: distance_between,
            age: age,
            images: search_user.profile.images,
            verified: search_user.verify,
            premium: search_user.premium,
            descritpion: search_user.profile.description,
            // categories
        };
        response_data.push(user_profile_data);
    });

    return res.status(HTTP_STATUSES.OK_200).json(response_data);
};
