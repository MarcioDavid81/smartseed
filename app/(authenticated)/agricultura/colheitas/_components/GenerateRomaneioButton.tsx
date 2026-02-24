import HoverButton from '@/components/HoverButton'
import { generateHarvestRomaneio } from '@/lib/generate-harvest-romaneio'
import { IndustryHarvestDetails } from '@/types'
import React from 'react'
import { FaFilePdf } from 'react-icons/fa'

type Props = {
  harvest: IndustryHarvestDetails
}

export default function GenerateRomaneioButton({ harvest }: Props) {
  return (
    <HoverButton
      className="flex gap-2 py-2"
      onClick={() => generateHarvestRomaneio(harvest)}
    >
      <FaFilePdf />
      Gerar Romaneio
    </HoverButton>
  )
}
