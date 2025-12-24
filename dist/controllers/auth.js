"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPassword = exports.RequestForgotPassword = exports.LoginUser = exports.VerifyEmail = exports.SendOTPEmail = exports.RegisterUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const email_1 = require("../templates/email");
const auth_1 = require("../utils/auth");
const email_2 = require("../utils/email");
const prisma_1 = __importDefault(require("../utils/prisma"));
const jwt_1 = require("../utils/jwt");
const RegisterUser = async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: "Email already exists" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { email, password: hashedPassword, firstname, lastname },
        });
        const otp = (0, auth_1.generateOTP)();
        await prisma_1.default.token.create({
            data: {
                token: otp,
                purpose: client_1.TOKEN_PURPOSE.EMAIL,
                userId: user.id,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        const emailresponse = await (0, email_2.sendEmail)(user.email, "Verify Your Email", (0, email_1.verifyEmailonRegistrationTemplate)(otp));
        console.log(emailresponse);
        res.json({ message: "User registered. Please verify your email." });
    }
    catch (err) {
        res.status(500).json({ error: "Something went wrong" });
        console.log("AN unexpected error occured", err);
    }
};
exports.RegisterUser = RegisterUser;
const SendOTPEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (!existingUser)
            return res.status(400).json({ error: "No user found" });
        await prisma_1.default.token.deleteMany({
            where: { userId: existingUser.id }
        });
        const otp = (0, auth_1.generateOTP)();
        await prisma_1.default.token.create({
            data: {
                token: otp,
                purpose: client_1.TOKEN_PURPOSE.EMAIL,
                userId: existingUser.id,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        console.log("About sending email");
        await (0, email_2.sendEmail)(existingUser.email, "Verify Your Email", (0, email_1.verifyEmailonRegistrationTemplate)(otp));
        res.json({ message: "OTP sent, kindly check your email" });
    }
    catch (err) {
        console.log("An unexpected error occurred", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.SendOTPEmail = SendOTPEmail;
const VerifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const token = await prisma_1.default.token.findFirst({
            where: { userId: user.id, token: otp, purpose: client_1.TOKEN_PURPOSE.EMAIL },
        });
        if (!token || token.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
        await prisma_1.default.user.update({ where: { id: user.id }, data: { isVerified: true } });
        await prisma_1.default.token.delete({ where: { id: token.id } });
        const authtoken = (0, jwt_1.generateJWT)({
            userId: user.id,
            email: user.email,
            firstname: user.firstname,
            profile_image: user.profile_image,
            lastname: user.lastname,
        });
        res.json({ message: "Email verified successfully", token: authtoken });
    }
    catch (err) {
        console.log("An unexpected error occured", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.VerifyEmail = VerifyEmail;
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        if (!user.isVerified) {
            await prisma_1.default.token.deleteMany({ where: { userId: user.id } });
            const otp = (0, auth_1.generateOTP)();
            await prisma_1.default.token.create({
                data: {
                    token: otp,
                    purpose: client_1.TOKEN_PURPOSE.EMAIL,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                },
            });
            await (0, email_2.sendEmail)(user.email, "Verify Your Email", (0, email_1.verifyEmailonRegistrationTemplate)(otp));
            return res.status(403).json({ error: "Please verify your email first" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = (0, jwt_1.generateJWT)({
            userId: user.id,
            email: user.email,
            firstname: user.firstname,
            profile_image: user.profile_image,
            lastname: user.lastname,
        });
        res.json({ message: "Login successful", token });
    }
    catch (err) {
        console.log("An unexpected error occured", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.LoginUser = LoginUser;
const RequestForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        await prisma_1.default.token.deleteMany({
            where: {
                userId: user.id,
                purpose: client_1.TOKEN_PURPOSE.PASSWORD,
            },
        });
        console.log("About sending email for forgot password\n");
        const otp = (0, auth_1.generateOTP)();
        await prisma_1.default.token.create({
            data: {
                token: otp,
                purpose: client_1.TOKEN_PURPOSE.PASSWORD,
                userId: user.id,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        const emailresponse = await (0, email_2.sendEmail)(user.email, "Password Reset OTP", (0, email_1.verifyEmailForPasswordChangeTemplate)(otp));
        console.log(emailresponse);
        res.json({ message: "Password reset OTP sent to email." });
    }
    catch (err) {
        console.log("An unexpected error occurred", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.RequestForgotPassword = RequestForgotPassword;
const ResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const token = await prisma_1.default.token.findFirst({
            where: { userId: user.id, token: otp, purpose: client_1.TOKEN_PURPOSE.PASSWORD },
        });
        if (!token || token.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
        await prisma_1.default.token.delete({ where: { id: token.id } });
        res.json({ message: "Password reset successful" });
    }
    catch (err) {
        console.log("An unexpected error occured", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.ResetPassword = ResetPassword;
