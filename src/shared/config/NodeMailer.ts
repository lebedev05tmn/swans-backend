import nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
    service: process.env.WORK_EMAIL_SERVICE,
    auth: {
        user: process.env.WORK_EMAIL || "swans.test.mail@gmail.com",
        pass: process.env.WORK_EMAIL_PASSWORD || "dCN-j6X-uDY-ijN"
    }
})