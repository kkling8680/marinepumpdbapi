import bcrypt from "bcryptjs";
import { TOKEN_PURPOSE } from "@prisma/client";
import { verifyEmailForPasswordChangeTemplate, verifyEmailonRegistrationTemplate } from "../templates/email";
import { generateOTP } from "../utils/auth";
import { sendEmail } from "../utils/email";
import prisma from "../utils/prisma";
import { generateJWT } from "../utils/jwt";

export const RegisterUser = async (req: any, res: any) => {
    try {
        const { email, password, firstname, lastname } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, firstname, lastname },
        });

        const otp = generateOTP();
        await prisma.token.create({
            data: {
                token: otp,
                purpose: TOKEN_PURPOSE.EMAIL,
                userId: user.id,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });

        const emailresponse = await sendEmail(user.email, "Verify Your Email", verifyEmailonRegistrationTemplate(otp));
        console.log(emailresponse)
        res.json({ message: "User registered. Please verify your email." });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
        console.log("AN unexpected error occured", err)
    }
}


export const SendOTPEmail = async (req: any, res: any) => {
    try {
        const { email } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) return res.status(400).json({ error: "No user found" });

        await prisma.token.deleteMany({
            where: { userId: existingUser.id }
        });

        const otp = generateOTP();
        await prisma.token.create({
            data: {
                token: otp,
                purpose: TOKEN_PURPOSE.EMAIL,
                userId: existingUser.id,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        console.log("About sending email")

        await sendEmail(
            existingUser.email,
            "Verify Your Email",
            verifyEmailonRegistrationTemplate(otp)
        );

        res.json({ message: "OTP sent, kindly check your email" });
    } catch (err) {
        console.log("An unexpected error occurred", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};


export const VerifyEmail = async (req: any, res: any) => {
    try {
        const { email, otp } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const token = await prisma.token.findFirst({
            where: { userId: user.id, token: otp, purpose: TOKEN_PURPOSE.EMAIL },
        });

        if (!token || token.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
        await prisma.token.delete({ where: { id: token.id } });

        const authtoken = generateJWT({
            userId: user.id,
            email: user.email,
            firstname: user.firstname,
            profile_image: user.profile_image,
            lastname: user.lastname,
        });

        res.json({ message: "Email verified successfully", token: authtoken });
    } catch (err) {
        console.log("An unexpected error occured", err)
        res.status(500).json({ error: "Something went wrong" });
    }
}


export const LoginUser = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        if (!user.isVerified) {
            await prisma.token.deleteMany({ where: { userId: user.id } });
            const otp = generateOTP();
            await prisma.token.create({
                data: {
                    token: otp,
                    purpose: TOKEN_PURPOSE.EMAIL,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                },
            });

            await sendEmail(user.email, "Verify Your Email", verifyEmailonRegistrationTemplate(otp));
            return res.status(403).json({ error: "Please verify your email first" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = generateJWT({
            userId: user.id,
            email: user.email,
            firstname: user.firstname,
            profile_image: user.profile_image,
            lastname: user.lastname,
        });

        res.json({ message: "Login successful", token });
    } catch (err) {
        console.log("An unexpected error occured", err)
        res.status(500).json({ error: "Something went wrong" });
    }
}

export const RequestForgotPassword = async (req: any, res: any) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        await prisma.token.deleteMany({
            where: {
                userId: user.id,
                purpose: TOKEN_PURPOSE.PASSWORD,
            },
        });

        console.log("About sending email for forgot password\n")

        const otp = generateOTP();
        await prisma.token.create({
            data: {
                token: otp,
                purpose: TOKEN_PURPOSE.PASSWORD,
                userId: user.id,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });

        const emailresponse = await sendEmail(
            user.email,
            "Password Reset OTP",
            verifyEmailForPasswordChangeTemplate(otp)
        );

        console.log(emailresponse)

        res.json({ message: "Password reset OTP sent to email." });
    } catch (err) {
        console.log("An unexpected error occurred", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};


export const ResetPassword = async (req: any, res: any) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const token = await prisma.token.findFirst({
            where: { userId: user.id, token: otp, purpose: TOKEN_PURPOSE.PASSWORD },
        });

        if (!token || token.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

        await prisma.token.delete({ where: { id: token.id } });

        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.log("An unexpected error occured", err)
        res.status(500).json({ error: "Something went wrong" });
    }
}