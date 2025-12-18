const tipoParaRota: Record<string, string> = {
    plantio: "consumption",
    colheita: "harvest",
    compra: "buys",
    venda: "sales",
    descarte: "beneficiation",
    ajuste: "seed-adjust",
  };
  
  export function getApiRouteFromTipo(tipo: string): string | undefined {
    return tipoParaRota[tipo.toLowerCase()];
  }
  