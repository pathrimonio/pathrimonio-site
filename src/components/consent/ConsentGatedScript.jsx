import { useEffect } from 'react';
import { useConsent } from '../../context/ConsentContext';

/**
 * Inyecta scripts de analítica o marketing en el DOM únicamente cuando el usuario
 * otorgó consentimiento explícito para la categoría indicada (`analytics` | `marketing`).
 * Si el usuario revoca el permiso posteriormente, retira el script del DOM.
 */
export default function ConsentGatedScript({
  id,
  category,
  src,
  inlineCode,
  async = true,
  defer = false,
  onLoad
}) {
  const { preferences } = useConsent();
  const isAllowed = Boolean(category && preferences?.[category] === true);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const scriptId = id || `consent-script-${category}-${btoa(src || inlineCode || '').slice(0, 12)}`;
    const existing = document.getElementById(scriptId);

    if (!isAllowed) {
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      return undefined;
    }

    if (existing) return undefined;

    const script = document.createElement('script');
    script.id = scriptId;
    script.dataset.consentCategory = category;

    if (src) {
      script.src = src;
      script.async = async;
      script.defer = defer;
      if (typeof onLoad === 'function') {
        script.onload = onLoad;
      }
    } else if (inlineCode) {
      script.text = inlineCode;
    }

    document.head.appendChild(script);

    return () => {
      const node = document.getElementById(scriptId);
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    };
  }, [id, category, src, inlineCode, async, defer, isAllowed, onLoad]);

  return null;
}
