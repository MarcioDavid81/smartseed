"use client";

import { Company } from "@/types";
import { createContext, useContext } from "react";

type UserCompanyType = {
  name: Company | null;
};

const CompanyContext = createContext<UserCompanyType>({
  name: null,
});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({
  name,
  children,
}: {
  name: Company | null;
  children: React.ReactNode;
}) => {
  return (
    <CompanyContext.Provider value={{ name }}>
      {children}
    </CompanyContext.Provider>
  );
};