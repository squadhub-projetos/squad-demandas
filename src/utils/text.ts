/**
 * Normaliza texto para comparação e busca:
 * remove acentos, colapsa espaços e ignora caixa.
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
