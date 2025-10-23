import { 
  AiOutlineDashboard 
} from "react-icons/ai";
import { 
  FaSeedling, FaTruck 
} from "react-icons/fa";
import { 
  GiFarmTractor 
} from "react-icons/gi";
import { 
  PiFarm 
} from "react-icons/pi";
import { 
  DollarSign, Scroll, ShoppingCart, Trash2, Warehouse, PackageSearch, ChartNoAxesCombined, BanknoteArrowUp, BanknoteArrowDown, Home, Building2, User 
} from "lucide-react";
import { TbTransferIn } from "react-icons/tb";
import Image from "next/image";
import combineIcon from "../../../../public/combine.ico";

export const routes = [
  {
    name: "Dashboard",
    icon: <AiOutlineDashboard size={20} />,
    path: "/dashboard",
  },
  {
    name: "Insumos",
    icon: <PiFarm size={20} />,
    subRoutes: [
      { name: "Compra", path: "/insumos/compras", icon: <ShoppingCart size={16} /> },
      { name: "Aplicação", path: "/insumos/aplicacoes", icon: <GiFarmTractor size={16} /> },
      { name: "Transferência", path: "/insumos/transferencias", icon: <TbTransferIn size={16} /> },
      { name: "Estoque", path: "/insumos/estoque", icon: <Warehouse size={16} /> },
      { name: "Produtos", path: "/insumos/produtos", icon: <PackageSearch size={16} /> },
    ],
  },
  {
    name: "Sementes",
    icon: <FaSeedling size={20} />,
    subRoutes: [
      { name: "Colheita", path: "/sementes/colheitas", icon: <FaSeedling size={16} /> },
      { name: "Compra", path: "/sementes/compras", icon: <ShoppingCart size={16} /> },
      { name: "Venda", path: "/sementes/vendas", icon: <DollarSign size={16} /> },
      { name: "Plantio", path: "/sementes/consumos", icon: <GiFarmTractor size={16} /> },
      { name: "Descarte", path: "/sementes/descartes", icon: <Trash2 size={16} /> },
      { name: "Cultivares", path: "/sementes/cultivares", icon: <FaSeedling size={16} /> },
      { name: "Estoque", path: "/sementes/estoque", icon: <Warehouse size={16} /> },
    ],
  },
  {
    name: "Agricultura",
    icon: <GiFarmTractor size={20} />,
    subRoutes: [
      { name: "Dashboard", path: "/agricultura/dashboard", icon: <AiOutlineDashboard size={16} /> },
      { name: "Colheita", path: "/agricultura/colheitas", icon: <Image src={combineIcon} alt="Agricultura" width={24} height={24} />
      },
      { name: "Transportadores", path: "/agricultura/transportadores", icon: <FaTruck size={16} /> },
      { name: "Depósitos", path: "/agricultura/depositos", icon: <Home size={16} /> },
      { name: "Estoque", path: "/agricultura/estoque", icon: <Warehouse size={16} /> },
      { name: "Safras", path: "/agricultura/safras", icon: <ChartNoAxesCombined size={16} /> },
    ],
  },
  {
    name: "Financeiro",
    icon: <ChartNoAxesCombined size={20} />,
    subRoutes: [
      { name: "Dashboard", path: "/financeiro/dashboard", icon: <AiOutlineDashboard size={16} /> },
      { name: "Contas a Pagar", path: "/financeiro/contas-a-pagar", icon: <BanknoteArrowUp size={16} /> },
      { name: "Contas a Receber", path: "/financeiro/contas-a-receber", icon: <BanknoteArrowDown size={16} /> },
    ],
  },
  {
    name: "Cadastros",
    icon: <Scroll size={20} />,
    subRoutes: [
      { name: "Empresas", path: "/cadastros/empresas", icon: <Building2 size={16} /> },
      { name: "Usuários", path: "/cadastros/usuarios", icon: <User size={16} /> },
    ],
    adminOnly: true,
  },
];
