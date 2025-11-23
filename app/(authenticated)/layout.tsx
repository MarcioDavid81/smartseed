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
import { BuyProvider } from "@/contexts/BuyContext";
import { SaleProvider } from "@/contexts/SaleContext";
import { BeneficiationProvider } from "@/contexts/BeneficiationContext";
import { ConsumptionProvider } from "@/contexts/ConsumptionContext";
import { MobileMenu } from "./_components/MenuMobile";
import { CycleProvider } from "@/contexts/CycleContext";
import { InsumoStockProvider } from "@/contexts/InsumoStockContext";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { ApplicationProvider } from "@/contexts/ApplicationContext";
import { TransferProvider } from "@/contexts/TransferContext";
import { ReceivableProvider } from "@/contexts/ReceivableContext";
import { PayableProvider } from "@/contexts/PayableContext";
import { IndustryHarvestProvider } from "@/contexts/IndustryHarvestContext";
import NewSidebar from "./_components/new-sidebar/sidebar";
import { IndustryStockProvider } from "@/contexts/IndustryStockContext";
import { IndustrySaleProvider } from "@/contexts/IndustrySaleContext";
import { ToastProvider } from "@/contexts/ToastContext";

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

  const safeUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        company: {
          id: company?.id ?? "",
          name: company?.name ?? "",
          plan: company?.plan ?? "",
        },
        imageUrl: user.imageUrl ?? "",
        role: user?.role ?? "USER",
      }
    : null;
  console.log("Vieram os dados fdp", safeUser);

  const safeCompany = company
    ? {
        id: company.id,
        name: company.name,
        plan: company.plan ?? "",
      }
    : null;
  console.log("vieram aqui tbm corno", safeCompany);

  return (
    <html lang="pt-BR">
      <body
        className={`${robotoFont.className} min-h-screen w-full antialiased md:flex`}
      >
        <CompanyProvider name={safeCompany}>
          <InsumoStockProvider>
            <StockProvider>
              <UserProvider user={safeUser}>
                <HarvestProvider>
                  <BuyProvider>
                    <SaleProvider>
                      <BeneficiationProvider>
                        <ConsumptionProvider>
                          <CycleProvider>
                            <PurchaseProvider>
                              <ApplicationProvider>
                                <TransferProvider>
                                  <ReceivableProvider>
                                    <PayableProvider>
                                      <IndustryHarvestProvider>
                                        <IndustryStockProvider>
                                          <IndustrySaleProvider>
                                            <NewSidebar />
                                            <MobileMenu />
                                            <ToastProvider>
                                              {children}
                                            </ToastProvider>
                                            <Toaster richColors />
                                          </IndustrySaleProvider>
                                        </IndustryStockProvider>
                                      </IndustryHarvestProvider>
                                    </PayableProvider>
                                  </ReceivableProvider>
                                </TransferProvider>
                              </ApplicationProvider>
                            </PurchaseProvider>
                          </CycleProvider>
                        </ConsumptionProvider>
                      </BeneficiationProvider>
                    </SaleProvider>
                  </BuyProvider>
                </HarvestProvider>
              </UserProvider>
            </StockProvider>
          </InsumoStockProvider>
        </CompanyProvider>
      </body>
    </html>
  );
}
