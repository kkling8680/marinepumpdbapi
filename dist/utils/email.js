"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
async function sendEmail(to, subject, html) {
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
    }
    catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send email");
    }
}
