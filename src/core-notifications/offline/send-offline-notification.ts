import axios from 'axios';
import { userRepository } from '../../core-user/routes/userRouter';

export const sendOfflineNotification = async (userId: string, title: string, body: string) => {
    try {
        const user = await userRepository.findOneByOrFail({
            user_id: userId,
        });

        const tokens = user.expo_push_tokens;

        if (!tokens || tokens.length === 0) {
            return;
        }

        tokens.map(async (token) => {
            const notification = {
                to: token,
                title: title,
                body: body,
            };

            try {
                const response = await axios.post('https://exp.host/--/api/v2/push/send', notification, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log(`notification has been sent: ${response.data}`);
            } catch (error: unknown) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.data?.errors?.some((msg: string) =>
                        msg.toLowerCase().includes('invalid push token'),
                    )
                ) {
                    user.expo_push_tokens = user.expo_push_tokens!.filter((t) => t !== token);
                } else {
                    console.log(`Ошибка при отправке на токен ${token}: ${error}`);
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
};
