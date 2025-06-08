const AboutSection = () => {
  return (
    <section id="about">
      <section className="py-16 px-4 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-12">Benefícios do Smart Seed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-white text-center">
        <h2 className="text-3xl font-bold mb-12">Como funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            "Cadastre seus lotes de produção",
            "Registre entradas e saídas de sementes",
            "Monitore validade e estoque",
            "Gere relatórios e etiquetas automaticamente",
          ].map((text, i) => (
            <div key={i} className="p-6 border rounded-xl">
              <span className="text-green text-4xl font-bold">{i + 1}</span>
              <p className="mt-4 text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default AboutSection;
