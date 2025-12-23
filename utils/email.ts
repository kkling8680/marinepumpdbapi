import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL, // must be a verified domain/sender in Resend
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Email sending failed:", error);
            throw new Error("Failed to send email");
        }

        return data;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send email");
    }
}
