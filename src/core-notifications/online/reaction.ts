import { Profile } from '../../core-profile/entities/Profile';

export const reactionNotification = (profile: Profile, message_id: number, reaction: string) => {
    return {
        type: 'reaction',
        name: profile.user_name,
        profile_picture: profile.images[0],
        message_id: message_id,
        reaction: reaction,
    };
};
