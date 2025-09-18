"use client";
import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about">
      <section className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 text-center">
        <motion.h2
          className="mb-12 text-3xl font-bold"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Benefícios do Smart Seed
        </motion.h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: "Controle de Lotes",
              desc: "Gerencie cada lote com rastreabilidade e informações detalhadas.",
            },
            {
              title: "Gestão de Estoque",
              desc: "Controle entradas, saídas para venda e consumo interno.",
            },
            {
              title: "Relatórios Inteligentes",
              desc: "Visualize dados e tome decisões com base em relatórios automáticos.",
            },
            {
              title: "Multiusuário e Multiempresa",
              desc: "Ideal para cooperativas, consultores e grupos agrícolas.",
            },
            {
              title: "Sistema 100% Online",
              desc: "Acesse de qualquer lugar, com segurança e performance.",
            },
            {
              title: "Suporte Especializado",
              desc: "Equipe pronta para ajudar você em todas as etapas.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="rounded-xl bg-white p-6 shadow-md"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16 text-center">
        <motion.h2
          className="mb-12 text-3xl font-bold"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Como funciona?
        </motion.h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-4">
          {[
            "Cadastre seus lotes de produção",
            "Registre entradas e saídas de sementes",
            "Monitore validade e estoque",
            "Gere relatórios e etiquetas automaticamente",
          ].map((text, i) => (
            <motion.div
              key={i}
              className="rounded-xl border p-6"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <span className="text-4xl font-bold text-green">{i + 1}</span>
              <p className="mt-4 text-gray-700">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default AboutSection;
