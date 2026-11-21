// Relación de aspecto de las fichas de interfaz.
// La detección es automática: se clasifica la proporción real de la imagen
// (ancho / alto) y, si no hay imagen, se usa la plataforma como fallback.

export const ASPECT_RATIO_LABELS = {
  phone: 'Teléfono (vertical)',
  tablet: 'Tablet',
  desktop: 'Escritorio'
};

// width / height -> categoría
export function classifyAspect(ratio) {
  if (!ratio || !Number.isFinite(ratio) || ratio <= 0) return null;
  if (ratio < 0.7) return 'phone';
  if (ratio < 1.15) return 'tablet';
  return 'desktop';
}

export function getEffectiveAspect(item, detectedRatio) {
  const ratio = detectedRatio ?? item?.imageAspect;
  const detected = classifyAspect(ratio);
  if (detected) return detected;

  return /^mobile/i.test(item?.platform || '') ? 'phone' : 'desktop';
}
