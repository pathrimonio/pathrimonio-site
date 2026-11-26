/**
 * Utilidades compartidas para leer y formatear la columna
 * `ultima_fecha_modificacion` en las especificaciones de interfaces.
 */

export function getRawLastModified(itemOrValue) {
  if (!itemOrValue) return null;
  if (typeof itemOrValue === 'string') return itemOrValue;
  if (itemOrValue instanceof Date) return itemOrValue.toISOString();
  return (
    itemOrValue.ultimaFechaModificacion ||
    itemOrValue.ultima_fecha_modificacion ||
    itemOrValue.updatedAt ||
    itemOrValue.approvedAt ||
    itemOrValue.createdAt ||
    null
  );
}

function parseModifiedDate(raw) {
  if (!raw) return null;
  const text = String(raw).trim();
  if (!text) return null;
  if (text.toLowerCase() === 'justo ahora') {
    return { date: new Date(), hasTime: true, raw: text };
  }
  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(text);
  const normalized = dateOnlyMatch ? `${text}T12:00:00` : text;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return { date: parsed, hasTime: !dateOnlyMatch, raw: text };
}

export function getInterfaceModifiedTimestamp(itemOrValue) {
  const raw = getRawLastModified(itemOrValue);
  const parsed = parseModifiedDate(raw);
  return parsed ? parsed.date.getTime() : 0;
}

export function formatInterfaceModifiedAt(itemOrValue) {
  const raw = getRawLastModified(itemOrValue);
  if (!raw) return null;
  const text = String(raw).trim();
  if (text.toLowerCase() === 'justo ahora') return 'Justo ahora';

  const parsed = parseModifiedDate(text);
  if (!parsed) return text;

  try {
    if (parsed.hasTime) {
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(parsed.date);
    }
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(parsed.date);
  } catch (_) {
    return text;
  }
}

export function formatInterfaceModifiedFull(itemOrValue) {
  const raw = getRawLastModified(itemOrValue);
  if (!raw) return null;
  const parsed = parseModifiedDate(raw);
  if (!parsed) return String(raw);
  try {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: parsed.hasTime ? 'short' : undefined,
      hour12: false
    }).format(parsed.date);
  } catch (_) {
    return String(raw);
  }
}
