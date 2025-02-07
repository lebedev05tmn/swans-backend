import { Request, Response } from 'express';

import generateUniqueId from '../utils/generateUniqueId';
import {
    generateJWT,
    generateRefreshToken,
} from '../../shared/utils/generateJWT';
import { HTTP_STATUSES } from '../../shared/utils/index';
import { User } from '../../core-user/models/entities/User';
import { Auth } from '../models/entities/Auth';
import { AppDataSource } from '../../shared/model';
import { AuthTypes } from '../../shared/utils/index';

const getAccessTokenByServiceAuth = async (req: Request, res: Response) => {
    /* Получение аксесс и рефреш токена при повторной регистрации через сторонние сервисы */
};

export default { getAccessTokenByServiceAuth };
