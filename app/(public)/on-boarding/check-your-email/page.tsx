import FuzzyText from "@/components/fuzzy-text";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirme seu email",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://www.marciodavid.dev.br" },
  ],
};

export default function CheckYourEmailPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <FuzzyText
          color="#63B926"
          fontWeight="bold"
          fontSize={80}
        >
          Confirme seu email
        </FuzzyText>
        <p className="mt-2 text-muted-foreground">
          Verifique seu email para confirmar sua conta.
        </p>
      </div>
    </div>
  );
}
