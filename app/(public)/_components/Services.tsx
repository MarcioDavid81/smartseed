const ServicesSection = () => {
    return ( 
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
     );
}
 
export default ServicesSection;