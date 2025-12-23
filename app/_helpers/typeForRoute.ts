const tipoParaRota: Record<string, string> = {
    plantio: "consumption",
    colheita: "harvest",
    compra: "buys",
    venda: "sales",
    descarte: "beneficiation",
    ajuste: "seed-adjust",
    transformacao: "transformation",
  };
  
  export function getApiRouteFromTipo(tipo: string): string | undefined {
    return tipoParaRota[tipo.toLowerCase()];
  }
  