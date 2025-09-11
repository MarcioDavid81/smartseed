"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import HoverButton from "./HoverButton";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");

    if (consent) {
      try {
        const dados = JSON.parse(consent);
        const agora = new Date().getTime();

        if (dados.expiracao && agora > dados.expiracao) {
          // Expirou, então remove e mostra o banner novamente
          localStorage.removeItem("cookie-consent");
          setVisible(true);
        }
      } catch (error) {
        console.error("Erro ao ler consentimento:", error);
        setVisible(true);
      }
    } else {
      // Nunca aceitou
      setVisible(true);
    }
  }, []);

  // Função para aceitar cookies e esconder o banner
  const acceptCookies = (minutos: number = 1) => {
    const agora = new Date().getTime();
    const dados = {
      valor: "aceito",
      expiracao: agora + minutos * 60 * 1000, // tempo em minutos
    };
    localStorage.setItem("cookie-consent", JSON.stringify(dados));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed bottom-2 right-1 left-1 rounded w-[99%] mx-auto bg-white border border-gray-200 shadow-lg py-4 px-8 z-50 flex flex-col gap-2 md:flex-row md:items-center md:justify-evenly"
      )}
    >
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Utilizamos cookies para melhorar sua experiência. Ao aceitar, você
        concorda com nossa{" "}
        <a href="/privacy-politic" className="text-green hover:underline">
          política de privacidade
        </a>
        .
      </p>
      <HoverButton onClick={acceptCookies} className="mt-2 md:mt-0">
        Aceitar
      </HoverButton>
    </motion.div>
  );
}
