import Marquee from "react-fast-marquee";

type Cultivar = {
  name: string;
  totalCultivar: number;
  totalDescarte: number;
  totalAjuste: number;
  porcentagemAproveitamento: number;
}

const ProductionMarquee = ({
  name,
  totalCultivar,
  totalDescarte,
  totalAjuste,
  porcentagemAproveitamento,
}: Cultivar) => {
  return ( 
    <Marquee speed={50} pauseOnHover={true}>
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <p className="text-black font-light text-sm">Cultivar:</p>
          <span className=" text-black font-light text-sm">{name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-black font-light text-sm">Total Colhido:</p>
          <span className=" text-black font-light text-sm">{totalCultivar.toLocaleString("pt-BR")} Kg</span>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-black font-light text-sm">Total Descartado:</p>
          <span className=" text-black font-light text-sm">{totalDescarte.toLocaleString("pt-BR")} Kg</span>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-black font-light text-sm">Total Ajustado:</p>
          <span className=" text-black font-light text-sm">{totalAjuste.toLocaleString("pt-BR")} Kg</span>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-black font-light text-sm">Total Semente:</p>
          <span className=" text-black font-light text-sm">{(totalCultivar - totalDescarte + totalAjuste).toLocaleString("pt-BR")} Kg</span>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-black font-light text-sm">Aproveitamento:</p>
          <span className=" text-black font-light text-sm">{porcentagemAproveitamento.toFixed(2)}%</span>
        </div>
      </div>
    </Marquee>
   );
}
 
export default ProductionMarquee;