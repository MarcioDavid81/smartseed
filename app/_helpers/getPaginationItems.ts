export function getPaginationItems(
  current: number,
  total: number,
  delta = 1
) {
  const range: (number | "...")[] = []
  const left = Math.max(0, current - delta)
  const right = Math.min(total - 1, current + delta)

  if (left > 0) {
    range.push(0)
    if (left > 1) range.push("...")
  }

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < total - 1) {
    if (right < total - 2) range.push("...")
    range.push(total - 1)
  }

  return range
}
