export function slugify(name: string, id: string) {
  return (
    name
      .normalize("NFD") // separa letras dos acentos
      .replace(/[\u0300-\u036f]/g, "") // remove os acentos
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
      .trim()
      .replace(/\s+/g, "-") + // troca espaços por "-"
    `-${id}`
  );
}

export function extractIdFromSlug(slug: string) {
  return slug?.split("-").pop() as string;
}
