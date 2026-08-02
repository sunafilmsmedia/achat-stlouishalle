export function formatCurrency(n: number | undefined): string {
  if (typeof n !== "number" || isNaN(n)) return "";
  return n.toLocaleString("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

export function parseCurrency(input: string): number | undefined {
  const cleaned = input.replace(/[^\d.,]/g, "").replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return undefined;
  const n = parseFloat(cleaned);
  if (isNaN(n)) return undefined;
  return Math.round(n);
}

export function groupedNumber(n: number | undefined): string {
  if (typeof n !== "number" || isNaN(n)) return "";
  return n.toLocaleString("fr-CA").replace(/ /g, " ");
}
