// import { Request, Response } from 'express';
// import { HTTP_STATUSES } from '../../shared/utils';
// import { profileRepository } from '../../shared/config';
// import getUserId from '../../core-auth/utils/getUserId';

// export const getProfileById = async (req: Request, res: Response) => {
//     const user_id = getUserId(req, res);

//     if (typeof user_id !== 'string') return;

//     try {
//         const profile = await profileRepository.findOne({
//             where: { user: { user_id: user_id } },
//             relations: ['user'],
//         });
//         if (profile) {
//             return res.json(profile);
//         } else {
//             return res
//                 .status(HTTP_STATUSES.NOT_FOUND_404)
//                 .send('profile not found');
//         }
//     } catch (error) {
//         return res
//             .status(HTTP_STATUSES.SERVER_ERROR_500)
//             .send(`Failed to load profile: ${error}`);
//     }
// };
