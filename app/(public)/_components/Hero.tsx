"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section
      id="#home"
      className="relative flex h-screen flex-col items-center justify-center bg-green bg-cover bg-center px-4 py-20 text-center text-4xl text-white"
      style={{ backgroundImage: "url('colheita.jpg')" }}
    >
      <div className="absolute inset-0 z-0 bg-black/50" />
      <motion.div
        className="z-10 mb-8 max-w-3xl"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="z-10 mb-8 text-5xl font-bold text-white md:text-6xl">
          SmartSeed
        </h1>
        <h1 className="z-10 mb-4 text-3xl font-bold md:text-4xl">
          O sistema completo para gestão agrícola!
        </h1>
        <p className="z-10 mx-auto mb-6 max-w-3xl text-lg md:text-xl">
          Organize, acompanhe e escale sua gestão agrícola com tecnologia
          pensada para produtores rurais.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.6 }}
        className="z-10 flex flex-col justify-center gap-4 md:flex-row">
        <Link
          href="#planos"
          className="rounded-full bg-white px-6 py-3 font-semibold text-green hover:bg-gray-100"
        >
          Ver Planos
        </Link>
        <Link
          href="/dashboard"
          className="duration-900 rounded-full border border-green px-6 py-3 font-semibold transition-colors ease-in-out hover:bg-white hover:text-green"
        >
          Acesse o sistema
        </Link>
      </motion.div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
        <ChevronDown className="h-8 w-8 text-green" />
      </div>
    </section>
  );
};

export default HeroSection;
