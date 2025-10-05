"use client";

import { useCompany } from "@/contexts/CompanyContext";

const Navbar = () => {
  const { name } = useCompany();
    return ( 
      <div>
        <p className="text-green text-sm">Produtor</p>
          {name?.name ? <span className="text-sm font-light">{name?.name.toUpperCase()}</span> : "NÃO IDENTIFICADO"}
      </div>
    );
}
 
export default Navbar;