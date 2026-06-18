const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { upload } = require('../config/upload');

// Sube una imagen, la guarda en disco (backend/uploads) y devuelve su URL.
// En la BD solo se guarda esa URL (texto), nunca el archivo.
router.post(
  '/imagen',
  authMiddleware,
  roleMiddleware('ADMIN', 'EMPLEADO'),
  upload.single('imagen'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(201).json({ url, mensaje: 'Imagen subida correctamente' });
  }
);

module.exports = router;
