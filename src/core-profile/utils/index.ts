export const convertSex = async (sex: string | boolean) => {
    return new Promise((resolve, reject) => {
        switch (sex) {
            case 'male':
                resolve(true);
                break;
            case 'female':
                resolve(false);
                break;
            case true:
                resolve('male');
                break;
            case false:
                resolve('female');
                break;
            default:
                reject('Invalid sex');
                break;
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
