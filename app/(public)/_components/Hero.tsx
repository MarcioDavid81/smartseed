import Link from "next/link";

const HeroSection = () => {
  return (
    <section
    id="#home"
      className="bg-green flex-col py-20 px-4 text-center relative h-screen bg-cover bg-center flex items-center justify-center text-white text-4xl"
      style={{ backgroundImage: "url('colheita.jpg')" }}
    >
      <div className="bg-black/50 absolute inset-0 z-0" />
      <h1 className="z-10 text-white text-5xl md:text-6xl font-bold mb-8">
        Smart Seed
      </h1>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 z-10">
        O sistema completo para gestão agrícola!
      </h1>
      <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto z-10">
        Organize, acompanhe e escale sua gestão agrícola com tecnologia pensada para produtores rurais.
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-4 z-10">
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
  );
};

export default HeroSection;
