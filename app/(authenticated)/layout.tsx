import type { Metadata } from "next";
import "../globals.css";
import roboto from "next/font/local";
import { MobileMenu } from "./_components/MenuMobile";
import NewSidebar from "./_components/new-sidebar/sidebar";
import { AppProviders } from "@/providers/AppProviders";
import { getCompanyFromToken, getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";

const robotoFont = roboto({
  src: [
    {
      path: "../../public/fonts/Roboto-Thin.ttf",
      weight: "100",
      style: "thin",
    },
    {
      path: "../../public/fonts/Roboto-Light.ttf",
      weight: "300",
      style: "light",
    },
    {
      path: "../../public/fonts/Roboto-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto-Medium.ttf",
      weight: "500",
      style: "medium",
    },
    {
      path: "../../public/fonts/Roboto-Bold.ttf",
      weight: "700",
      style: "bold",
    },
    {
      path: "../../public/fonts/Roboto-Black.ttf",
      weight: "900",
      style: "black",
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
  verification: {
    google: "iujCtqRV2IM9SBkAlFhc6qixIgiTU5gOhbi__yUjCmI",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getUserFromToken();
  const company = await getCompanyFromToken();
  if (!user || !company) {
  redirect("/login");
}

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    companyId: user.companyId,
    company: {
      id: company.id,
      name: company.name,
      plan: company.plan ?? "",
    },
    imageUrl: user.imageUrl ?? "",
    role: user.role ?? "USER",
  };

  const safeCompany = company
    ? {
        id: company.id,
        name: company.name,
        plan: company.plan ?? undefined,
      }
    : null;

  return (
    <html lang="pt-BR">
      <body
        className={`${robotoFont.className} min-h-screen w-full antialiased md:flex`}
      >
        <AppProviders user={safeUser} company={safeCompany}>
          <NewSidebar />
          <MobileMenu />
          {children}
        </AppProviders>                                                
      </body>
    </html>
  );
}
