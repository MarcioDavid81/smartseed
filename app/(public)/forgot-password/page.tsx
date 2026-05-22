import { Metadata } from "next";
import { EmailRecover } from "./_components/email-recover";

export const metadata: Metadata = {
  title: "Recuperar senha",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    {
      name: "Marcio David",
      url: "https://www.marciodavid.dev.br",
    },
  ],
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <EmailRecover />
      </div>
    </div>
  );
}