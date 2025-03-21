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
    auth: {
        user: process.env.WORK_EMAIL || 'swans.test.mail@gmail.com',
        pass: process.env.WORK_EMAIL_PASSWORD || 'dCN-j6X-uDY-ijN',
    },
    tls: {
        rejectUnauthorized: true,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    connectionTimeout: 30000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
});
