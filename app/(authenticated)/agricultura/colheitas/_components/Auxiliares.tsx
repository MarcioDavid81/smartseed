export function Info({
  label,
  value,
  highlight,
}: {
  label: string
  value?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "bg-primary/5 border-primary" : ""
      }`}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  )
}

export function Discount({
  label,
  percent,
  kg,
}: {
  label: string
  percent?: number
  kg?: number
}) {
  return (
    <div className="rounded-xl border p-4 bg-destructive/5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">
        {percent}% — {kg} kg
      </p>
    </div>
  )
}
