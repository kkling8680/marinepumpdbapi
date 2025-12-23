"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
const crypto_1 = __importDefault(require("crypto"));
function generateOTP() {
    return crypto_1.default.randomInt(100000, 999999).toString();
}
