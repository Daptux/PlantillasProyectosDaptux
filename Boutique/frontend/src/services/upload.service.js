import api from './api.js';

// Sube una imagen suelta y devuelve { url }
export const uploadService = {
  product: (file) => upload('/uploads/product', file),
  banner: (file) => upload('/uploads/banner', file),
  user: (file) => upload('/uploads/user', file),
};

function upload(endpoint, file) {
  const form = new FormData();
  form.append('image', file);
  return api
    .post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
}
