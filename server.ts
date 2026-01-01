import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user"
import path from "path";

import corsOptions from "./config/corsOptions";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import { logger } from "./middleware/logger";

dotenv.config();
const app = express();

app.use(corsOptions);
app.use(logger);

app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.get("/delete-account", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "delete-account.html"));
});

app.get("/privacy-policy", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "privacy-policy.html"));
});

app.get("/", (req, res) => res.send("API is running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
