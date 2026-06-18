// Imágenes por defecto según el tipo de habitación (cuando no hay imagen_url propia)
export const IMG_TIPO = {
  INDIVIDUAL: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=70',
  DOBLE: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=70',
  SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=70',
  FAMILIAR: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=70'
};

export const imgHab = (h) => h?.imagen_url || IMG_TIPO[h?.tipo] || IMG_TIPO.DOBLE;
