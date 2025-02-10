import { Request, Response } from 'express';

import { HTTP_STATUSES } from '../../shared/utils/index';
import { transporter } from '../../shared/config/NodeMailer';


const sendMail = async (req: Request, res: Response) => {
    const mail_to_send = req.query.mail_to_send as string;
    console.log(mail_to_send)

    if (mail_to_send) {
        const mailOptions = {
            from: process.env.WORK_EMAIL,
            to: mail_to_send,
            subject: "Test email from Node.js",
            text: "Test message from another mailbox."
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                    message: `Error occured while sendind mail to '${mail_to_send}'`,
                    details: error
                })
            } else {
                return res.status(HTTP_STATUSES.OK_200).json({
                    message: info
                })
            }
        })
    } else {
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            message: 'Bad request! Check your data.'
        });
    }
};

export default { sendMail };