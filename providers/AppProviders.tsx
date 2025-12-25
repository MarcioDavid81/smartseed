"use client"

import "../app/globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import { StockProvider } from "@/contexts/StockContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { HarvestProvider } from "@/contexts/HarvestContext";
import { BuyProvider } from "@/contexts/BuyContext";
import { SaleProvider } from "@/contexts/SaleContext";
import { BeneficiationProvider } from "@/contexts/BeneficiationContext";
import { ConsumptionProvider } from "@/contexts/ConsumptionContext";
import { CycleProvider } from "@/contexts/CycleContext";
import { InsumoStockProvider } from "@/contexts/InsumoStockContext";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { ApplicationProvider } from "@/contexts/ApplicationContext";
import { TransferProvider } from "@/contexts/TransferContext";
import { ReceivableProvider } from "@/contexts/ReceivableContext";
import { PayableProvider } from "@/contexts/PayableContext";
import { IndustryHarvestProvider } from "@/contexts/IndustryHarvestContext";
import { IndustryStockProvider } from "@/contexts/IndustryStockContext";
import { IndustrySaleProvider } from "@/contexts/IndustrySaleContext";
import { IndustryTransferProvider } from "@/contexts/IndustryTransferContext";
import { ToastProvider } from "@/contexts/ToastContext";
import TanstackProvider from "@/providers/tanstack"
import { ReactNode } from "react";
import { AppUser, Company } from "@/types";

type Props = {
  children: ReactNode;
  user: AppUser;
  company: Company | null;
};

export function AppProviders({ children, user, company }: Props) {

  return (
    <TanstackProvider>
      <CompanyProvider name={company}>
        <InsumoStockProvider>
          <StockProvider>
            <UserProvider user={user}>
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
                                          <IndustryTransferProvider>
                                            <ToastProvider>
                                              {children}
                                              <Toaster richColors />
                                            </ToastProvider>
                                          </IndustryTransferProvider>
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
    </TanstackProvider>
  )
}
