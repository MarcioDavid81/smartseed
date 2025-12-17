"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  machines: {
    id: string
    name: string
  }[]
  value: string
  onChange: (value: string) => void
}

export function MachineSelect({ machines, value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecione a máquina" />
      </SelectTrigger>

      <SelectContent>
        {machines.map(machine => (
          <SelectItem key={machine.id} value={machine.id}>
            <span className="text-sm font-light">{machine.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
