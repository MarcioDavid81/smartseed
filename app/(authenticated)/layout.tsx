import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Roboto_Condensed } from "next/font/google";
import "../globals.css";
import Sidebar from "./_components/Sidebar";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import { getCompanyFromToken, getUserFromToken } from "@/lib/auth";
import { StockProvider } from "@/contexts/StockContext";
import { CompanyProvider } from "@/contexts/CompanyContext";

const inter = Inter({
  weight: ["100", "200", "300", "400", "700"],
  style: "normal",
  display: "swap",
  subsets: ["latin-ext"],
});

const roboto = Roboto_Condensed({
  weight: ["100", "200","300", "400", "700"],
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
  const company = await getCompanyFromToken();

  const safeUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        imageUrl: user.imageUrl ?? "",
      }
    : null;

    const safeCompany = company
    ? {
        id: company.id,
        name: company.name,
      }
    : null;

  return (
    <html lang="pt-BR">
      <body
        className={`${roboto.className} antialiased  md:flex  w-full min-h-screen`}
      >
        <CompanyProvider name={safeCompany}>
        <StockProvider>
          <UserProvider user={safeUser}>
            <Sidebar />
            {children}
            <Toaster />
          </UserProvider>
        </StockProvider>
        </CompanyProvider>
      </body>
    </html>
  );
}
