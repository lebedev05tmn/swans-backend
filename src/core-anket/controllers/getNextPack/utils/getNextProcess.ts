import { pack_size } from '../../../../shared/utils';
import { User } from '../../../../core-user/models/entities/User';
import { dating_sessions } from '../../startDating/utils/sortAnkets';
import { serialize_pack } from './serializePack';
import { update_session } from './updateSession';

export const get_next_pack_process = async (current_user: User) => {
    if (!dating_sessions.has(current_user.user_id)) {
        return { success: false, message: `Session doesn't exists` };
    }

    const ankets = dating_sessions.get(current_user.user_id);
    if (!ankets?.length) {
        update_session(current_user);
        if (!dating_sessions.get(current_user.user_id)?.length) {
            dating_sessions.delete(current_user.user_id);
            return { success: false, message: `Zero ankets` };
        }
    }

    if (ankets && ankets.length <= pack_size) {
        const pack = ankets;
        dating_sessions.delete(current_user.user_id);
        return { success: true, message: `Last ankets`, pack: pack };
    }

    if (ankets && ankets.length >= pack_size) {
        const pack = ankets.slice(0, pack_size);
        const new_ankets = ankets.slice(pack_size - 1);
        dating_sessions.set(current_user.user_id, new_ankets);
        return { success: true, message: `Successfully get new pack`, pack: await serialize_pack(pack, current_user) };
    }
};
