"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkedAlt, FaNetworkWired, FaTasks, FaChartPie } from 'react-icons/fa';

const steps = [
  {
    icon: FaMapMarkedAlt,
    title: "1. Cadastre sua Propriedade",
    description: "Cadastre sua fazenda em minutos. Cadastre talhões, cultivares de sementes e crie sua primeira safra/ciclo.",
  },
  {
    icon: FaNetworkWired,
    title: "2. Adicione seus Dados Financeiros",
    description: "Lance notas de compra de sementes e insumos e tenha rapidamente uma visão geral de estoque, custos e contas a pagar.",
  },
  {
    icon: FaTasks,
    title: "3. Execute e Monitore",
    description: "Crie ordens de serviço, distribua para a equipe via app e acompanhe a execução.",
  },
  {
    icon: FaChartPie,
    title: "4. Analise e Otimize",
    description: "Relatórios automáticos de custos, produtividade. Compare talhões, identifique gargalos e planeje a próxima safra.",
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="como-funciona" className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Do Cadastro à Colheita em <span className="text-green">4 Passos</span>
          </h2>
          <p className="text-lg text-gray-600">
            Simplificamos a gestão agrícola para que você foque no que realmente importa: produzir mais e melhor.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300"
              >
                {/* Step Number Badge */}
                <div className="w-16 h-16 bg-green text-white rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-lg shadow-green/30 group-hover:scale-110 transition-transform duration-300">
                  <step.icon />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">{step.description}</p>
                
                {/* Connector for Mobile (Visual only) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute bottom-0 left-1/2 w-1 h-8 bg-gray-200 translate-y-full -translate-x-1/2"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
