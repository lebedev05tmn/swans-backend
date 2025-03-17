import { Request, Response } from "express";
import { HTTP_STATUSES } from "../../../../shared/utils";

const check_request_data = (req: Request, res: Response) => {
    const request_data: any = req.body;
    let {
        user_id: current_user_id,
        service_user_id: service_id,
        service_name,
    } = request_data;
    if (
        !(
            current_user_id &&
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
    service_name = service_name ? service_name : 'Unknown';

    if (service_name === 'Unknown') {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Bad Service name!',
        });
    }

    return [service_id, service_name, current_user_id];
}

export default check_request_data;
