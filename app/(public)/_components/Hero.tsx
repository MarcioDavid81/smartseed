"use client";

import { motion } from "framer-motion";
import { Mouse, UserLock } from "lucide-react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";


const HeroSection = () => {
  return (
    <section
      id="#home"
      className="relative flex h-screen flex-col items-center justify-center bg-green bg-cover bg-center px-4 py-20 text-center text-4xl text-white"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600747476229-ceb7f3493f60?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
    >
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
          <Link href="#planos">
            <button className="bg-green hover:bg-green/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-primary-500/30 flex items-center justify-center gap-2 group">
              Ver Planos
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
            <Link href="/dashboard">
            <button className="bg-green hover:bg-green/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-primary-500/30 flex items-center justify-center gap-2 group">
              Acessar o Sistema
              <UserLock className="group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
      </motion.div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
        <Mouse className="h-8 w-8 text-green" />
      </div>
    </section>
  );
};

export default HeroSection;
