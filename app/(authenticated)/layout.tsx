import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "./_components/Sidebar";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import { getCompanyFromToken, getUserFromToken } from "@/lib/auth";
import { StockProvider } from "@/contexts/StockContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { HarvestProvider } from "@/contexts/HarvestContext";
import roboto from "next/font/local";

const robotoFont = roboto({
  src: [
    {
      path: '../../public/fonts/Roboto-Thin.ttf',
      weight: '100',
      style: 'thin',
    },
    {
      path: '../../public/fonts/Roboto-Light.ttf',
      weight: '300',
      style: 'light',
    },
        {
      path: '../../public/fonts/Roboto-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Roboto-Medium.ttf',
      weight: '500',
      style: 'medium',
    },
    {
      path: '../../public/fonts/Roboto-Bold.ttf',
      weight: '700',
      style: 'bold',
    },
    {
      path: '../../public/fonts/Roboto-Black.ttf',
      weight: '900',
      style: 'black',
    },
  ],
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
        className={`${robotoFont.className} antialiased  md:flex  w-full min-h-screen`}
      >
        <CompanyProvider name={safeCompany}>
        <StockProvider>
          <UserProvider user={safeUser}>
            <HarvestProvider>
            <Sidebar />
            {children}
            <Toaster />
            </HarvestProvider>
          </UserProvider>
        </StockProvider>
        </CompanyProvider>
      </body>
    </html>
  );
}
