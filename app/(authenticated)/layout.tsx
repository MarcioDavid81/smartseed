import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Roboto_Condensed}  from "next/font/google";
import "../globals.css";
import Sidebar from "./_components/Sidebar";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import { getUserFromToken } from "@/lib/auth"; 

const inter = Inter({
  weight: ["300", "400", "700"],
  style: "normal",
  display: "swap",
  subsets: ["latin-ext"],
});

const roboto = Roboto_Condensed({
  weight: ["300", "400", "700"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getUserFromToken();

  const safeUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        imageUrl: user.imageUrl ?? "",
      }
    : null;

  return (
    <html lang="pt-BR">
      <body className={`${roboto.className} antialiased md:flex  w-full min-h-screen`}>
        <UserProvider user={safeUser}>
        <Sidebar />
        {children}
        <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
