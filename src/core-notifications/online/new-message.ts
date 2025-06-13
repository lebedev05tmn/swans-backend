import { Profile } from '../../core-profile/entities/Profile';

export const newMessageNotification = (profile: Profile, text: string) => {
    return {
        type: 'new-message',
        name: profile.user_name,
        profile_picture: profile.images[0],
        message_text: text,
    };
};
