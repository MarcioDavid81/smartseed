import Link from "next/link";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-6 bg-white">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-3xl font-bold text-green mb-6">
          Entre em contato
        </h3>
        <p className="text-gray-700 mb-6">
          Preencha o formulário abaixo e entraremos em contato com você para
          apresentar o Smart Seed.
        </p>
        <form className="space-y-4 text-left">
          <input
            type="text"
            placeholder="Nome"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Mensagem"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="w-full p-3 bg-green text-white rounded-lg hover:bg-green/90 transition"
          >
            Enviar mensagem
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
