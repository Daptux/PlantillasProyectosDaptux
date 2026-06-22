import { asyncHandler, ApiError } from '../utils/helpers.js';
import { publicUrl } from '../middlewares/upload.middleware.js';

// Genérico: devuelve la URL pública del archivo subido.
// El subfolder se infiere del campo file.destination, pero usamos un map por ruta.
function handler(subfolder) {
  return asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No se recibió ningún archivo');
    res.status(201).json({ url: publicUrl(subfolder, req.file.filename), filename: req.file.filename });
  });
}

export const uploadProductImage = handler('products');
export const uploadBannerImage = handler('banners');
export const uploadUserImage = handler('users');
