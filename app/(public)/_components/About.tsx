import Image from "next/image";

const AboutSection = () => {
    return (
        <section id="about" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-3xl font-bold text-green-800 mb-4">Sobre o Smart Seed</h3>
              <p className="text-gray-700 text-lg">
                O Smart Seed é um sistema completo para o controle e rastreabilidade da produção de sementes,
                oferecendo organização e produtividade para produtores e cooperativas.
              </p>
            </div>
            <Image
              src="https://plus.unsplash.com/premium_photo-1661818052197-0b5c33c0cb32"
              alt="Produção de sementes"
              width={600}
              height={400}
              className="rounded-xl shadow-md"
            />
          </div>
        </section>
      );
}
 
export default AboutSection;