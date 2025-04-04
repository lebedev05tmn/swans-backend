import { Request, Response } from "express";
import { HTTP_STATUSES } from ".";

type UseController = {
    controller: (req: Request, res: Response) => Promise<void>;
    req: Request;
};

export type TError = {
    status: number;
    message: string
}

export default async <T>({ controller, req }: UseController): Promise<T | TError>=> {
    let result: T | TError = { status: HTTP_STATUSES.NO_CONTENT_204, message: "No response generated." };

    const response = {
        json: (value: T) => {
            result = value;
        },
        status: (status: number) => ({
            json: (message: string) => {
                result = {status, message}
            },
        })
    };

    await controller(req, response as Response);

    return result;
};