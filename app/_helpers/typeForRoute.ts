const tipoParaRota: Record<string, string> = {
    plantio: "consumption",
    colheita: "harvest",
    compra: "buys",
    venda: "sales",
    descarte: "beneficiation",
  };
  
  export function getApiRouteFromTipo(tipo: string): string | undefined {
    return tipoParaRota[tipo.toLowerCase()];
  }
  