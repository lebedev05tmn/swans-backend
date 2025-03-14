import { Response } from "express";
import { HTTP_STATUSES } from "../../shared/utils";

const check_request_data = (service_id: string, service_name: string, res: Response) => {
    if (
        !(
            service_id &&
            service_name &&
            typeof service_id === 'string' &&
            typeof service_name === 'string'
        )
    ) {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Missing Data or invalid type. Check your request data!',
        });
    }
}

export default check_request_data;
