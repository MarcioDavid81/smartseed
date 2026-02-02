import { Button } from '@/components/ui/button'
import { generateHarvestRomaneio } from '@/lib/generate-harvest-romaneio'
import { IndustryHarvest } from '@/types'
import React from 'react'

type Props = {
  harvest: IndustryHarvest
}

export default function GenerateRomaneioButton({ harvest }: Props) {
  return (
    <Button
      variant="outline"
      onClick={() => generateHarvestRomaneio(harvest)}
    >
      Gerar Romaneio
    </Button>
  )
}
