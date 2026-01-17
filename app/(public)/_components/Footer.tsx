import Image from 'next/image';
import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Image src="/5.png" alt="SmartSeed" width={320} height={40} />
            <p className="text-gray-400 text-sm leading-relaxed">
              <span>O sistema nervoso central da sua fazenda.</span> Conectando operação, clima e finanças para uma agricultura de precisão.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaLinkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaFacebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaTwitter size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Planos</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Integrações</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Atualizações</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-primary-400 transition-colors">Sobre</a></li>
              <li><a href="#planos" className="hover:text-primary-400 transition-colors">Planos</a></li>
              <li><a href="/blog" className="hover:text-primary-400 transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-primary-400 transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>contato@smartseed.app.br</li>
              <li>(55) 99711-6476</li>
              <li>Rua Albino Medeiros de Farias, 296</li>
              <li>Tupanciretã - RS</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} SmartSeed. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="/terms-of-use" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="/privacy-politic" className="hover:text-white transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
