"use client";

import { useCompany } from "@/contexts/CompanyContext";

const Navbar = () => {
    const { name } = useCompany();
    return ( 
        <div>
            <p className="text-green text-sm">Produtor</p>
            <span className="text-sm font-light">{name?.name.toUpperCase()}</span>
        </div>
     );
}
 
export default Navbar;