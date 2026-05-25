// utils/formatarData.js
// Helper único e robusto pra formatar datas em DD/MM/YYYY,
// independente do que venha (string YYYY-MM-DD, Date object, etc.)

function formatarDataBR(valor) {
  if (!valor) return '—';

  let y, m, d;

  if (valor instanceof Date) {
    // É Date object — usa UTC pra evitar timezone glitch
    y = valor.getUTCFullYear();
    m = String(valor.getUTCMonth() + 1).padStart(2, '0');
    d = String(valor.getUTCDate()).padStart(2, '0');
  } else if (typeof valor === 'string') {
    // Tenta padrão "YYYY-MM-DD" (com ou sem hora)
    const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      [, y, m, d] = match;
    } else {
      // Fallback: tenta parsear como Date
      const dt = new Date(valor);
      if (isNaN(dt)) return '—';
      y = dt.getUTCFullYear();
      m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      d = String(dt.getUTCDate()).padStart(2, '0');
    }
  } else {
    return '—';
  }

  return `${d}/${m}/${y}`;
}

/**
 * Devolve string YYYY-MM-DD a partir de Date ou string
 * (útil pra comparações e queries)
 */
function isoDate(valor) {
  if (!valor) return null;
  if (valor instanceof Date) {
    const y = valor.getUTCFullYear();
    const m = String(valor.getUTCMonth() + 1).padStart(2, '0');
    const d = String(valor.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof valor === 'string') {
    const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
    const dt = new Date(valor);
    if (isNaN(dt)) return null;
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
}

module.exports = { formatarDataBR, isoDate };
