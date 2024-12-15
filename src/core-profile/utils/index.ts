export const convertSex = async (sex: string | boolean) => {
    return new Promise((resolve, reject) => {
        if (typeof sex === 'boolean') {
            if (sex === true) resolve('male');
            else resolve('female');
        } else {
            if (sex === 'male') resolve(true);
            else resolve(false);
        }
    });
};

export type ProfileType = {
    user_id: number;
    user_name: string;
    birth_date: Date;
    sex: boolean;
    images: string[];
    short_desc: string;
    long_desc: string;
    categories: string[];
};
