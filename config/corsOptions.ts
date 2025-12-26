import cors from "cors";

const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(o => o.trim());

const allowAllOrigins = allowedOrigins.includes("*");

const corsOptions = cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, Swagger UI, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }
        
        // If wildcard is set, allow all origins
        if (allowAllOrigins) {
            callback(null, true);
            return;
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: !allowAllOrigins,
    optionsSuccessStatus: 200,
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    maxAge: 86400, // 24 hours - cache preflight requests
});

export default corsOptions;