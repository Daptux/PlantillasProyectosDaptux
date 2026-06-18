import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";

const app = express();

// Seguridad y middlewares base
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Archivos subidos (acceso a documentos/resultados por URL).
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API clinica-app operativa", data: { status: "ok" } });
});

// API
app.use("/api", apiRoutes);

// 404 + manejador global de errores (al final)
app.use(notFound);
app.use(errorHandler);

export default app;
