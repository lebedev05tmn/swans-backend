// import { Request, Response } from 'express';
// import { HTTP_STATUSES } from '../../shared/utils';
// import { Profile } from '../entities/Profile';
// import getUserId from '../../core-auth/utils/getUserId';
// import { AppDataSource } from '../../shared/model';
// import { User } from '../../core-user/models/entities/User';

// export const createProfile = async (req: Request, res: Response) => {
//     const user_id = getUserId(req, res);

//     if (typeof user_id !== 'string') return;

//     const userRepository = AppDataSource.getRepository(User);
//     const currentUser = await userRepository.findOne({
//         where: { user_id: user_id },
//     });
//     if (!currentUser)
//         return res.status(HTTP_STATUSES.NOT_FOUND_404).json({
//             message: 'User not found!',
//         });

//     try {
//         const newUser = {
//             user_name: req.body.user_name,
//             birth_date: req.body.birth_date,
//             sex: req.body.sex,
//             images: req.body.images,
//             description: req.body.description,
//             categories: req.body.categories,
//             city: req.body.city,
//         };

//         const requiredParams = [
//             newUser.user_name,
//             newUser.birth_date,
//             newUser.sex,
//             newUser.images,
//             newUser.city,
//         ];

//         const correct = requiredParams.reduce(
//             (acc, param) => acc && !param,
//             true,
//         );

//         if (!correct) return res.status(400).send('Invalid input data');

//         const profile = Profile.create({
//             user_name: newUser.user_name,
//             birth_date: newUser.birth_date,
//             sex: newUser.sex,
//             images: newUser.images,
//             description: newUser.description,
//             categories: newUser.categories,
//             city: newUser.city,
//         });

//         currentUser.profile = profile;
//         await userRepository.save(currentUser);
//         return res.status(201).json(newUser);
//     } catch (error) {
//         return res.status(500).send(`Failed to create user profile: ${error}`);
//     }
// };
