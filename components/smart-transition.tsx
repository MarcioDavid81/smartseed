"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function SmartTransition() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 z-[99] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-4"
    >
      <Image src="/6.png" alt="logo" width={500} height={500} className="animate-bounce" />
    </motion.div>
  );
}