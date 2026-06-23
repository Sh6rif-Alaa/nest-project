import nodemailer from "nodemailer";

export const sendEmail = async (mailOptions: nodemailer.SendMailOptions): Promise<boolean> => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL!,
            pass: process.env.PASSWORD!,
        },
    });

    const info = await transporter.sendMail({
        from: `"nestApp" ${process.env.EMAIL!}`,
        ...mailOptions
    });

    console.log("Message sent:", info?.messageId);

    return info.accepted.length ? true : false
}

export const generateOTP = async (): Promise<string> => {
    return Math.floor(Math.random() * 900000 + 100000).toString()
}