import { io } from '../../app';
import { newMessageNotification } from './new-message';
import { reactionNotification } from './reaction';

export const sendOnlineNotification = (type: string, recipientSocketId: string, data: Record<string, any>) => {
    switch (type) {
        case 'new-message':
            io.to(recipientSocketId).emit('notification', newMessageNotification(data.profile, data.text));
            break;
        case 'reaction':
            io.to(recipientSocketId).emit(
                'notification',
                reactionNotification(data.profile, data.message_id, data.reaction),
            );
            break;
    }
};
