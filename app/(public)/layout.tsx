import CookieConsent from "@/components/cookie-consent";
import { ToastProvider } from "@/contexts/ToastContext";
import TanstackProvider from "@/providers/tanstack";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";
import { BackToTop } from "./_components/BackToTop";

const inter = Inter({
  weight: ["400", "700"],
  style: "normal",
  display: "swap",
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: {
    absolute: "",
    default: "Smart Seed - Gestão de Produção de Sementes",
    template: "Smart Seed - %s",
  },
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://www.marciodavid.dev.br" },
  ],
    verification: {
    google: "iujCtqRV2IM9SBkAlFhc6qixIgiTU5gOhbi__yUjCmI",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} antialiased`}
      >
        <TanstackProvider>
          <ToastProvider>
            <BackToTop />
            {children}
            <Toaster richColors />
            <CookieConsent />
          </ToastProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}
