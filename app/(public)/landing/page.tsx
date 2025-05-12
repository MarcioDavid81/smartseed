import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="bg-green flex-col py-20 px-4 text-center relative h-screen bg-cover bg-center flex items-center justify-center text-white text-4xl"
        style={{ backgroundImage: "url('colheita.jpg')" }}
      >
        <div className="bg-black/50 absolute inset-0 z-0" />
        <h1 className="z-10 text-white text-5xl md:text-6xl font-bold mb-8">Smart Seed</h1>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 z-10">
          O sistema completo para controle de produção de sementes
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto z-10">
          Organize, acompanhe e escale sua produção com tecnologia pensada para
          sementeiras e produtores de sementes.
        </p>
        <div className="flex justify-center gap-4 z-10">
          <Link
            href="#planos"
            className="bg-white text-green px-6 py-3 rounded-full font-semibold hover:bg-gray-100"
          >
            Ver Planos
          </Link>
          <Link
            href="/dashboard"
            className="border border-green px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-green transition-colors duration-900 ease-in-out"
          >
            Acesse o sistema
          </Link>
        </div>
      </section>

      {/* Benefícios */}
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

      {/* Planos e Preços */}
      <section id="planos" className="py-16 px-4 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-12">Escolha seu plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Básico",
              price: "R$ 49/mês",
              features: [
                "1 usuário",
                "Controle de lotes",
                "Relatórios básicos",
              ],
            },
            {
              name: "Profissional",
              price: "R$ 99/mês",
              features: [
                "Até 5 usuários",
                "Estoque e movimentações",
                "Relatórios avançados",
              ],
            },
            {
              name: "Sementeira",
              price: "R$ 199/mês",
              features: [
                "Multiempresa",
                "Equipe ilimitada",
                "Suporte prioritário",
              ],
            },
          ].map((plan, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-2xl text-green font-bold mb-4">{plan.price}</p>
              <ul className="text-gray-700 mb-6 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
              <button className="bg-green text-white px-4 py-2 rounded-full hover:bg-green/80">
                Assinar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-green text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para transformar sua gestão de sementes?
        </h2>
        <p className="text-lg mb-6">
          Comece agora ou agende uma demonstração com nossa equipe.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="#"
            className="bg-white text-green px-6 py-3 rounded-full font-semibold hover:bg-gray-100"
          >
            Criar Conta
          </Link>
          <Link
            href="#contato"
            className="border border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-green"
          >
            Falar com Especialista
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-1 px-4 text-center">
        <p>&copy; 2025 Smart Seed. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
