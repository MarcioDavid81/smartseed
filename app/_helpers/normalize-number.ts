export function normalizeNumber(value: any) {
  if (value == null) return 0;

  return Number(
    String(value)
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );
}
