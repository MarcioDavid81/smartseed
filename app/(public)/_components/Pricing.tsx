"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import { FaCheck } from 'react-icons/fa';

const plans = [
  {
    name: "Trial",
    price: "00,00",
    unit: "/mês",
    description: "Para você testar por 7 dias.",
    features: [
      "Todas as funcionalidades do plano PREMIUM",
      "Ao terminar o período de teste você será redirecionado para o plano BASIC, caso não haja upgrade."
    ],
    cta: "Começar Teste Grátis",
    highlight: false
  },
  {
    name: "Premium",
    price: "99,00",
    unit: "/mês",
    description: "A solução completa para gestão de alta performance.",
    features: [
      "Hectares Ilimitados",
      "Todas as Funcionalidades",
      "5 Usuários Inclusos",
      "Integrações Climáticas",
      "Rastreabilidade Básica",
      "Suporte Prioritário",
      "Treinamento Online"
    ],
    cta: "Cadastrar sua Propriedade",
    highlight: true
  },
  {
    name: "Basic",
    price: "00,00",
    unit: "/mês",
    description: "Limite de cadastros e lançamentos.",
    features: [
      "1 Fazenda",
      "1 Talhão",
      "1 Safa/Ciclo",
      "10 Lançamentos de colheitas",
      "1 Usuário",
      "Relatórios Básicos"
    ],
    cta: "Cadastrar sua Propriedade",
    highlight: false
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="planos" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Investimento que se Paga na <span className="text-green">Primeira Safra</span>
          </h2>
          <p className="text-lg text-gray-600">
            Escolha o plano ideal para o tamanho da sua operação. Sem custos ocultos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 min-h-[500px] ${
                plan.highlight 
                  ? 'bg-white border-green shadow-2xl scale-105 z-10' 
                  : 'bg-gray-50 border-gray-100 hover:border-green hover:shadow-lg'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                  Mais Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6 h-10">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  {plan.price.includes('Sob') ? 'Consulta' : `R$ ${plan.price}`}
                </span>
                <span className="text-gray-500 text-sm font-medium">{plan.unit}</span>
              </div>

              <Link href="/on-boarding">
              <button className={`w-full py-3 rounded-xl font-bold mb-8 transition-colors ${
                plan.highlight 
                  ? 'bg-green text-white hover:bg-green/90 shadow-lg shadow-green/30' 
                  : 'bg-white text-green border-2 border-green hover:bg-green-50'
              }`}>
                {plan.cta}
              </button>
              </Link>
              
              <ul className="space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <FaCheck className={`mt-0.5 ${plan.highlight ? 'text-green' : 'text-gray-400'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-12">
          * Preços para safra 2024/2025. Isenção de impostos para agricultura familiar.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
