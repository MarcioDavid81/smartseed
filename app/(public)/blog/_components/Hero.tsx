"use client";

import { motion } from "framer-motion";

interface HeroProps {
  title: string;
  subtitle: string;
}



const HeroBlog = ({ title, subtitle }: HeroProps) => {
  return (
    <section
      id="#home"
      className="relative flex h-[400px] flex-col items-center justify-center bg-cover bg-center px-4 py-20 text-center text-4xl text-white"
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
          {title}
        </h1>
        <p className="z-10 mx-auto mb-6 max-w-3xl text-lg md:text-xl">
          {subtitle}
        </p>
      </motion.div>
    </section>
  );
};

export default HeroBlog;
