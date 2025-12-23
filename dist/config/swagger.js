"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Pump-DB API",
            version: "1.0.0",
            description: "API documentation for Pump-DB project 🚀",
        },
        servers: [
            {
                url: process.env.ROOT_URL,
                description: "Local dev server",
            },
        ],
    },
    //   Look for JS Doc comments using dynamic route approach
    apis: ["./routes/*.ts"],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
