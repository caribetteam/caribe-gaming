
export interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  imagemUrl: string;
  plataforma: string;
  categoria: string;
}

const CHAVE_CARRINHO = "caribe-gaming-carrinho";

export function recuperarCarrinho(): ItemCarrinho[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const conteudo = localStorage.getItem(CHAVE_CARRINHO);

    if (!conteudo) return [];

    const dados: unknown = JSON.parse(conteudo);

    if (!Array.isArray(dados)) return [];

    return dados.filter((item): item is ItemCarrinho => {
      if (!item || typeof item !== "object") return false;

      const p = item as Record<string, unknown>;

      return (
        typeof p["id"] === "number" &&
        typeof p["nome"] === "string" &&
        typeof p["preco"] === "number" &&
        Number.isFinite(p["preco"]) &&
        p["preco"] >= 0 &&
        typeof p["quantidade"] === "number" &&
        Number.isInteger(p["quantidade"]) &&
        p["quantidade"] > 0 &&
        typeof p["imagemUrl"] === "string" &&
        typeof p["plataforma"] === "string" &&
        typeof p["categoria"] === "string"
      );
    });
  } catch {
    return [];
  }
}

export function calcularTotalCarrinho(
  carrinho: ItemCarrinho[]
): number {
  return carrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );
}

export function limparCarrinho(): void {
  localStorage.removeItem(CHAVE_CARRINHO);

}