import { User } from '../../core-user/models/entities/User';

export const calculate_distance = (
    coord1: { x: number; y: number } | null,
    coord2: { x: number; y: number } | null,
): number => {
    if (!coord1 || !coord2) {
        throw new Error('Coordinates must contains values!');
    }

    const R = 6371e3;
    const f1 = (coord1.y * Math.PI) / 180;
    const f2 = (coord2.y * Math.PI) / 180;
    const delta_f = ((coord2.y - coord1.y) * Math.PI) / 180;
    const delta_lambda = ((coord2.x - coord1.x) * Math.PI) / 180;

    const a =
        Math.sin(delta_f / 2) * Math.sin(delta_f / 2) +
        Math.cos(f1) * Math.cos(f2) * Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const get_full_age = (birth: Date): number => {
    const current_date: Date = new Date();
    let age = current_date.getFullYear() - birth.getFullYear();

    const month_diff = current_date.getMonth() - birth.getMonth();
    if (month_diff < 0 || (month_diff === 0 && current_date.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

export const get_last_visit = (last_visit: Date): number => {
    const current_date = new Date();
    const time_diff = Math.abs(current_date.getTime() - last_visit.getTime());
    const days_diff = Math.ceil(time_diff / (1000 * 60 * 60 * 24));

    return days_diff;
};

export const calculate_score = (current_user: User, user: User, distance: number) => {
    let score: number = 0;
    // distance
    if (distance < 100) {
        score = score + 20;
    } else if (distance <= 10000) {
        score = score + 20 * (1 - (distance - 100) / 9900);
    }

    // last_visit_days
    const last_visit_days: number = get_last_visit(user.last_visit);
    if (last_visit_days < 1) {
        score = score + 15;
    } else if (last_visit_days <= 7) {
        score = score + 15 * (1 - (last_visit_days - 1) / 6);
    }

    // categories
    const set_user = new Set(user.profile.categories);
    let counter: number = 0;

    for (const category of current_user.profile.categories) {
        if (set_user.has(category)) {
            counter = counter + 1;
        }
    }
    return score + counter;
};
