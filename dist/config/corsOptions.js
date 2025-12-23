"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(o => o.trim());
const corsOptions = (0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, Swagger UI, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes("*")) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    // Add these headers to support Swagger UI better
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
});
exports.default = corsOptions;
