import Link from "next/link";

const HeroSection = () => {
    return (
        <section id="home" className="pt-24 pb-16 px-6 bg-green-50 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">Controle Inteligente de Produção de Sementes</h2>
            <p className="text-lg text-gray-700 mb-6">
              Sistema para gestão da produção de sementes de soja, trigo e forrageiras de inverno.
            </p>
            <Link href="/dashboard" className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
              Login
            </Link>
          </div>
        </section>
      );
}
 
export default HeroSection;