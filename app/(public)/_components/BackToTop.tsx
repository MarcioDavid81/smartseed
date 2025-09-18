'use client'

import { TbArrowNarrowUp } from 'react-icons/tb'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import HoverButton from '@/components/HoverButton'

export const BackToTop = () => {
  const [show, setShow] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleScroll = useCallback(() => {
    if (!show && window.scrollY > 500) setShow(true)
    if (show && window.scrollY <= 500) setShow(false)
  }, [show])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed right-4 bottom-10 z-20"
          initial={{ opacity: 0, right: -10 }}
          animate={{ opacity: 1, right: 16 }}
          exit={{ opacity: 0, right: -10 }}
        >
          <HoverButton
            onClick={scrollToTop}
            className="shadow-lg shadow-primary/20 !rounded-full w-14 h-14 text-center flex items-center justify-center"
          >
            <TbArrowNarrowUp size={30} />
          </HoverButton>
        </motion.div>
      )}
    </AnimatePresence>
  )
}