"use client"

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FaSpinner } from "react-icons/fa";
import React from 'react';
import { motion } from 'framer-motion';
import z from 'zod';
import { useSmartToast } from "@/contexts/ToastContext";
import { sendContactAction } from "@/actions/send-contact";

const contactSchema = z.object({
  user_name: z.string().min(1, "Nome é obrigatório"),
  user_email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  message: z.string().min(1, "Mensagem é obrigatória"),
});

type ContactForm = z.infer<typeof contactSchema>;

const CTA: React.FC = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<ContactForm>>({});
  const { showToast } = useSmartToast();

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSending(true);
    e.preventDefault();
    if (!formRef.current) return;

    // Coleta manual dos dados
    const formData = new FormData(formRef.current);
    const data = {
      user_name: String(formData.get("user_name") ?? ""),
      user_email: String(formData.get("user_email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const result = await sendContactAction({
      name: data.user_name,
      email: data.user_email,
      message: data.message,
    });

    if (result.success) {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Mensagem enviada com sucesso!",
      });
      formRef.current?.reset();
    } else {
      showToast({
        type: "error",
        title: "Erro",
        message: result.error ?? "Erro ao enviar mensagem",
      });
    }
    setIsSending(false);
  };

  return (
    <section id="contato" className="py-24 bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-green-900 via-green to-gray-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Sua próxima safra mais <span className="text-gray-900">inteligente</span> começa aqui
            </h2>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Junte-se agora aos produtores que já transformaram sua gestão agrícola. Agende uma demonstração personalizada e veja o SmartSeed em ação na sua realidade.
            </p>
            
            <ul className="space-y-4 mb-8">
              {['Aumento de produtividade garantido', 'Redução de custos operacionais', 'Suporte técnico especializado'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-200">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-900">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-green mb-6">Entre em contato</h3>
            <form className="space-y-4" ref={formRef} onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" name="user_name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green focus:border-green outline-none transition-all" placeholder="Seu nome" />
                {validationErrors.user_name && <p className="text-red text-sm">{validationErrors.user_name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
                <input type="email" name="user_email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green focus:border-green outline-none transition-all" placeholder="seu@email.com" />
                {validationErrors.user_email && <p className="text-red text-sm">{validationErrors.user_email}</p>}
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea name="message" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green focus:border-green outline-none transition-all" placeholder="Digite sua mensagem aqui"></textarea>
                  {validationErrors.message && <p className="text-red text-sm">{validationErrors.message}</p>}
                </div>

              <button type="submit" disabled={isSending} className="w-full bg-green hover:bg-green/90 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all mt-4">
                {isSending ? <FaSpinner className="inline-block animate-spin" /> : "Enviar Mensagem"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
