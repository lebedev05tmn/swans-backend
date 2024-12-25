const jwtConfig = {
    secret: process.env.JWT_SECRET || 'standart_secret',
    expiresIn: process.env.JWT_EXPIRES || '1h',
    algorithm: process.env.JWT_ALGORITHM || 'HS256'
};

export default jwtConfig;
