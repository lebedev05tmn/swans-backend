import nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.WORK_EMAIL || "swans.test.mail@gmail.com",
        pass: process.env.WORK_EMAIL_PASSWORD || "dCN-j6X-uDY-ijN"
    }
})