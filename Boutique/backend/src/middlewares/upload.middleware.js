import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '..', 'uploads');

// Genera un middleware multer para una subcarpeta (products | banners | users)
function makeUploader(subfolder) {
  const dest = path.join(uploadsRoot, subfolder);
  fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Formato de imagen no permitido'));
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
}

export const uploadProduct = makeUploader('products');
export const uploadBanner = makeUploader('banners');
export const uploadUser = makeUploader('users');

// Construye la URL pública relativa de un archivo subido
export function publicUrl(subfolder, filename) {
  return `/uploads/${subfolder}/${filename}`;
}
