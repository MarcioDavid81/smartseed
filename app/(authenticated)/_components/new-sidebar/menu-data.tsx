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
  DollarSign, Scroll, ShoppingCart, Trash2, Warehouse, PackageSearch, ChartNoAxesCombined, BanknoteArrowUp, BanknoteArrowDown, Home, Building2, User, 
  MapIcon,
  FuelIcon,
  Cog
} from "lucide-react";
import { TbTransferIn } from "react-icons/tb";
import Image from "next/image";
import combineIcon from "../../../../public/combine.ico";
import { GrHostMaintenance } from "react-icons/gr";
import { GiFuelTank } from "react-icons/gi";

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
      { name: "Dashboard", path: "/sementes/dashboard", icon: <AiOutlineDashboard size={16} /> },
      { name: "Colheita", path: "/sementes/colheitas", icon: <Image src={combineIcon} alt="Agricultura" width={24} height={24} /> },
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
    icon: <Image src={combineIcon} alt="Agricultura" width={24} height={24} />,
    subRoutes: [
      { name: "Dashboard", path: "/agricultura/dashboard", icon: <AiOutlineDashboard size={16} /> },
      { name: "Colheitas", path: "/agricultura/colheitas", icon: <Image src={combineIcon} alt="Agricultura" width={24} height={24} />
      },
      { name: "Vendas", path: "/agricultura/vendas", icon: <DollarSign size={16} /> },
      { name: "Transferências", path: "/agricultura/transferencias", icon: <TbTransferIn size={16} /> },
      { name: "Transportadores", path: "/agricultura/transportadores", icon: <FaTruck size={16} /> },
      { name: "Depósitos", path: "/agricultura/depositos", icon: <Home size={16} /> },
      { name: "Estoque", path: "/agricultura/estoque", icon: <Warehouse size={16} /> },
      { name: "Talhões", path: "/agricultura/talhoes", icon: <MapIcon size={16} /> },
      { name: "Safras", path: "/agricultura/safras", icon: <ChartNoAxesCombined size={16} /> },
    ],
  },
  {
    name: "Máquinas",
    icon: <GiFarmTractor size={20} />,
    subRoutes: [
      { name: "Dashboard", path: "/maquinas/dashboard", icon: <AiOutlineDashboard size={16} /> },
      { name: "Máquinas", path: "/maquinas/maquinas", icon: <GiFarmTractor size={16} /> },
      { name: "Tanques", path: "/maquinas/tanques", icon: <GiFuelTank size={16} /> },
      { name: "Compras", path: "/maquinas/compras", icon: <ShoppingCart size={16} /> },
      { name: "Manutenções", path: "/maquinas/manutencoes", icon: <GrHostMaintenance size={16} /> },
      { name: "Abastecimentos", path: "/maquinas/abastecimentos", icon: <FuelIcon size={16} /> },
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
  {
    name: "Assinaturas",
    icon: <Cog size={20} />,
    subRoutes: [
      { name: "Gerenciar", path: "/assinaturas", icon: <Cog size={16} /> },
    ],
  },
];
