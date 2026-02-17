export interface StateUF {
  id: number;
  sigla: string;
  nome: string;
}

export interface City {
  id: number;
  nome: string;
}

const BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function getStates(): Promise<StateUF[]> {
  const res = await fetch(`${BASE_URL}/estados`);

  if (!res.ok) {
    throw new Error("Erro ao carregar estados");
  }

  const data: StateUF[] = await res.json();

  return data.sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function getCitiesByState(
  stateId: string | number,
): Promise<City[]> {
  const res = await fetch(`${BASE_URL}/estados/${stateId}/municipios`);

  if (!res.ok) {
    throw new Error("Erro ao carregar cidades");
  }

  const data: City[] = await res.json();

  return data.sort((a, b) => a.nome.localeCompare(b.nome));
}
