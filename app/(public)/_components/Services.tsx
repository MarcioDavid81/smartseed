const ServicesSection = () => {
    return ( 
        <section id="services" className="py-20 px-6 bg-green-100">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-3xl font-bold text-green-800 mb-12">Serviços</h3>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { title: "Gestão de Lotes", icon: "🌱" },
            { title: "Rastreamento de Qualidade", icon: "🔍" },
            { title: "Relatórios Detalhados", icon: "📊" }
          ].map((service, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h4 className="text-xl font-semibold text-green-700 mb-2">{service.title}</h4>
              <p className="text-gray-600">
                Soluções práticas para cada etapa do processo de produção e controle.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
     );
}
 
export default ServicesSection;