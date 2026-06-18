import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "./error.middleware";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const unique = `${base}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

/** Middleware de carga de archivos (documentos / resultados). */
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new AppError("Tipo de archivo no permitido (PDF, JPG, PNG, WEBP)", 415));
    }
    cb(null, true);
  },
});
