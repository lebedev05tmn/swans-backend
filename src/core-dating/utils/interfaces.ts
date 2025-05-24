export interface filters {
    sex: string | undefined;
    age: number[] | undefined; // [begin_search, end_search]
    distance: number[] | undefined; // [begin_search, end_search] в метрах
    premium: boolean | undefined;
    verificated: boolean | undefined;
    categories: string[] | undefined;
}

export interface datingParams {
    token: string;
    filters: filters | undefined;
}
