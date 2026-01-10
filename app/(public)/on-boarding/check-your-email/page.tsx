import FuzzyText from "@/components/fuzzy-text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
    { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
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
