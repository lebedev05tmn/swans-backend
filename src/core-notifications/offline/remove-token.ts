import { userRepository } from '../../core-user/routes/userRouter';
import { decodeUserId } from '../../core-auth/utils/getUserId';

export const removeExpoPushToken = async (accessToken: string, expoPushToken: string) => {
    const userId = await decodeUserId(accessToken);

    const user = await userRepository.findOneByOrFail({
        user_id: userId,
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.expo_push_tokens || user.expo_push_tokens.length === 0) return;

    user.expo_push_tokens = user.expo_push_tokens.filter((token) => token !== expoPushToken);

    await userRepository.save(user);
};
