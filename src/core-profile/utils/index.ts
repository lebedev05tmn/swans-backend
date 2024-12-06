export const getSexString = async (sex_bool: boolean) => {
    return new Promise((resolve, reject) => {
        if (sex_bool === true) resolve('male');
        else resolve('female');
    });
};

export const getSexBoolean = async (sex_string: string) => {
    return new Promise((resolve, reject) => {
        if (sex_string === 'male') resolve(true);
        else resolve(false);
    });
};
