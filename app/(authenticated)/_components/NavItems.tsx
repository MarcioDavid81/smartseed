"use client"

import { useCompany } from "@/contexts/CompanyContext";
import CompanyData from "./CompanyData";
import Navbar from "./Navbar";
import Saudacao from "./Saudacao";
import SelectCycle from "./SelectCycle";

const NavItems = () => {
  const { name } = useCompany();
  return (
    <div className="flex flex-col items-start space-y-4 md:flex-row md:items-center md:space-x-10 md:space-y-0">
      <Saudacao />
      <Navbar />
      <CompanyData plan={name?.plan ?? undefined} />
      <SelectCycle />
    </div>
  );
};

export default NavItems;
