"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getToken } from "@/lib/auth-client"

interface Talhao {
  id: string
  name: string
  area: number
  farm: {
    id: string
    name: string
  }
}

interface MultiSelectTalhaoProps {
  value: string[]
  onChange: (selected: string[]) => void
}

export function MultiSelectTalhao({ value, onChange }: MultiSelectTalhaoProps) {
  const [open, setOpen] = React.useState(false)
  const [talhoes, setTalhoes] = React.useState<Talhao[]>([])
  const [loading, setLoading] = React.useState(true)

  // Buscar talhões da API
  React.useEffect(() => {
    const fetchTalhoes = async () => {
      try {
        const token = getToken()
        if (!token) {
          console.error("Token não encontrado")
          setLoading(false)
          return
        }

        const response = await fetch("/api/plots", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTalhoes(data)
        } else {
          console.error("Erro ao buscar talhões:", response.statusText)
        }
      } catch (error) {
        console.error("Erro ao buscar talhões:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTalhoes()
  }, [])

  const safeTalhoes = talhoes || []
  const safeValue = value || []

  const selectedLabels = safeTalhoes
    .filter(t => t && t.id && safeValue.includes(t.id))
    .map(t => t.name)
    .join(", ")

  const toggleValue = (talhaoId: string) => {
    const newValue = safeValue.includes(talhaoId)
      ? safeValue.filter(id => id !== talhaoId)
      : [...safeValue, talhaoId]
    onChange(newValue)
  }

  if (loading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between"
        disabled
      >
        Carregando talhões...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLabels || "Selecione os talhões..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar talhão..." />
          <CommandEmpty>Nenhum talhão encontrado.</CommandEmpty>
          <CommandGroup>
            {safeTalhoes.map((t) => (
              <CommandItem
                key={t.id}
                value={t.name}
                onSelect={() => toggleValue(t.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    safeValue.includes(t.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>{t.name}</span> - <span className="font-light">{t.area} ha</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
