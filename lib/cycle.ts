export function getCycle() {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem("selectedCycle");
  return item ? JSON.parse(item) : null;
}