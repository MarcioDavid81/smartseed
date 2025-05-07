"use client";

import { useUser } from "@/contexts/UserContext";

const Saudacao = () => {
  const { user } = useUser();
  const congrat = () => {
    if (new Date().getHours() >= 0 && new Date().getHours() < 12) {
      return "Bom dia";
    } else if (new Date().getHours() >= 12 && new Date().getHours() < 18) {
      return "Boa tarde";
    } else {
      return "Boa noite";
    }
  };

  const today = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <p className="text-green text-sm">{congrat()} </p>
      <span className="text-sm font-light">
        {user?.name.trimStart().split(" ")[0]}, {today}.
      </span>
    </div>
  );
};
export default Saudacao;
