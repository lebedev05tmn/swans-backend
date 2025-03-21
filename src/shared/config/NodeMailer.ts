import nodemailer from 'nodemailer';

console.log(
    process.env.WORK_EMAIL_SERVICE,
    process.env.WORK_EMAIL,
    process.env.WORK_EMAIL_PASSWORD,
);
export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.WORK_EMAIL || 'swans.test.mail@gmail.com',
        pass: process.env.WORK_EMAIL_PASSWORD || 'dCN-j6X-uDY-ijN',
    },
    logger: true,
    debug: true,
});
