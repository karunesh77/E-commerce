import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());

// CLIENT_URL mein comma-separated multiple origins bhi ho sakte hain
// (customer frontend aur admin panel — alag ports pe chalte hain)
const allowedOrigins = process.env.CLIENT_URL?.split(",").map((o) => o.trim());
app.use(cors({
   origin: [
    "http://localhost:5173",
    "https://YOUR-CLOUDFRONT-DOMAIN.cloudfront.net"
  ],
  credentials: true,
}));  

// ─── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, try again later" },
});
app.use("/api", limiter);

// ─── General Middleware ────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ─── Swagger API Docs ─────────────────────────────────────────
// Browser mein dekho: http://localhost:5000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "E-commerce API Docs",
  customCss: ".swagger-ui .topbar { display: none }",
}));

app.use("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});


// ─── Routes ───────────────────────────────────────────────────
app.use("/api/v1", routes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


// ─── Global Error Handler ─────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});
app.use(errorHandler);

export default app;
