import { pack_size } from '../../../../shared/utils';
import { User } from '../../../../core-user/models/entities/User';
import { dating_sessions } from '../../startDating/utils/sortAnkets';

export const get_next_pack_process = (current_user: User) => {
    if (!dating_sessions.has(current_user.user_id)) {
        return { success: false, message: `Session doesn't exists` };
    }

    const ankets = dating_sessions.get(current_user.user_id);
    if (!ankets) {
        dating_sessions.delete(current_user.user_id);
        return { success: false, message: `Zero ankets` };
    }

    if (ankets && ankets.length <= pack_size) {
        const pack = ankets;
        dating_sessions.delete(current_user.user_id);
        return { success: true, message: `Last ankets`, pack: pack };
    }

    const pack = ankets.slice(0, pack_size);
    const new_ankets = ankets.slice(pack_size - 1);
    dating_sessions.set(current_user.user_id, new_ankets);
    return { success: true, message: `Successfully get new pack`, pack: pack };
};
