"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

const faqs = [
  {
    question: "Preciso de internet no campo para usar?",
    answer: "Sim! O sistema funciona totalmente online, com acesso via navegador, de qualquer dispositivo com conexão à internet."
  },
  {
    question: "Quanto tempo leva para implementar?",
    answer: "Em média 3 dias. Fornecemos templates por cultura e suporte na importação de dados existentes."
  },
  {
    question: "E a segurança dos meus dados?",
    answer: "Servidores AWS Brasil, backup diário, criptografia SSL 256-bit e compliance LGPD. Seus dados são só seus."
  },
  {
    question: "Funciona para quais culturas?",
    answer: "Todas! Soja, milho, café, cana, fruticultura, hortifrúti. Templates específicos para cada uma."
  },
  {
    question: "Posso testar antes de comprar?",
    answer: "7 dias grátis com todas as funcionalidades. Sem cartão de crédito necessário."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dúvidas <span className='text-green'>Frequentes</span>
          </h2>
          <p className="text-lg text-gray-600">
            Respostas para as perguntas mais comuns dos nossos clientes.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                <FaChevronDown 
                  className={`text-gray-400 transition-transform duration-300 ${openIndex === index ? 'transform rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
