const Footer = () => {
  return (
    <footer className="bg-green text-white text-center text-xs py-4 flex flex-col md:flex-row md:justify-evenly md:items-center">
      <p>
        &copy; {new Date().getFullYear()} Smart Seed. Todos os direitos
        reservados.
      </p>
      <p>
        Desenvolvido por{' '}
        <a
          href="https://md-webdeveloper.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:text-gray-300"
        >
          MD - Web Developer
        </a>
      </p>
      <p>
        <a
          href="/privacy-politic"
          className="text-white underline hover:text-gray-300"
        >
          Política de Privacidade
        </a>
        {' | '}
        <a
          href="/terms-of-use"
          className="text-white underline hover:text-gray-300"
        >
          Termos de Uso
        </a>
      </p>
    </footer>
  );
};

export default Footer;
