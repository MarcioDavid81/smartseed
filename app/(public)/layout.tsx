import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";

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
    { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
