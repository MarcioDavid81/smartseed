'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import HoverButton from './HoverButton'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookie-consent')
    if (!hasAccepted) setVisible(true)
  }, [])

  // Função para aceitar cookies e esconder o banner
  // Armazena a aceitação no localStorage para não exibir novamente
  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    className={cn(
      'fixed bottom-0 w-full mx-auto bg-white border border-gray-200 shadow-lg py-4 px-8 z-50 flex flex-col gap-2 md:flex-row md:items-center md:justify-evenly',
    )}>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa política. Em caso de dúvidas, consulte nossa{' '}
        <a href="/privacy-politic" className="text-green hover:underline">política de privacidade</a>.
      </p>
      <HoverButton onClick={acceptCookies} className="mt-2 md:mt-0">
        Aceitar
      </HoverButton>
    </motion.div>
  )
}
