import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import CookieConsent from "@/components/cookie-consent";
import { BackToTop } from "./_components/BackToTop";
import { ToastProvider } from "@/contexts/ToastContext";
import { UserProvider } from "@/contexts/UserContext";
import { getCompanyFromToken, getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} antialiased`}
      >
        <UserProvider user={safeUser} >
        <ToastProvider>
          <BackToTop />
          {children}
          <Toaster richColors />
          <CookieConsent />
        </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
