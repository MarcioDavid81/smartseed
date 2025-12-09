export function slugify(name: string, id: string) {
  return (
    name
      .normalize("NFD") // separa letras dos acentos
      .replace(/[\u0300-\u036f]/g, "") // remove os acentos
      .toLowerCase() // deixa tudo minúsculo
      .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
      .trim() // remove espaços em branco no início e no fim
      .replace(/\s+/g, "-") + // troca espaços por "-"
    `-${id}`
  );
}

export function extractIdFromSlug(slug: string) {
  return slug?.split("-").pop() as string;
}
