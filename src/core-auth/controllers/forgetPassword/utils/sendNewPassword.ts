import { HTTP_STATUSES } from "../../../../shared/utils";
import { transporter } from "../../../../shared/config/NodeMailer";

const send_new_password = (mail_info: any) => {

    const [email, new_password, res] = mail_info;
    
    const mailOptions = {
        from: process.env.WORK_EMAIL,
        to: email,
        subject: 'Swans. Получение забытого пароля',
        text: `Ваш новый пароль '${new_password}'. Для вашей же безопасности следует изменить данный пароль в кратчайшие сроки.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(HTTP_STATUSES.SERVER_ERROR_500).json({
                message: `Error occured while sendind mail to '${email}'`,
                details: error,
            });
        } else {
            return res.status(HTTP_STATUSES.OK_200).json({
                message: info,
            });
        }
    });
}

export default send_new_password;
