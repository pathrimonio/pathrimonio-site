import { useEffect, useState } from 'react';

/**
 * Devuelve la proporción real (ancho / alto) de una imagen.
 * Si la ficha ya trae el valor guardado, lo usa; si no, mide la imagen en el navegador.
 */
export function useImageAspect(src, storedRatio) {
  const [ratio, setRatio] = useState(storedRatio || null);

  useEffect(() => {
    if (storedRatio) {
      setRatio(storedRatio);
      return;
    }
    if (!src) {
      setRatio(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled && image.naturalWidth && image.naturalHeight) {
        setRatio(image.naturalWidth / image.naturalHeight);
      }
    };
    image.onerror = () => {
      if (!cancelled) setRatio(null);
    };
    image.src = src;

    return () => { cancelled = true; };
  }, [src, storedRatio]);

  return ratio;
}
