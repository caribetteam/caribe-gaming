// src/app/core/utils/slug.ts
// Converte o nome do jogo em endereço bonito ("The Witcher 3: Wild Hunt" -> "the-witcher-3-wild-hunt")
// e consegue voltar do endereço para o appid da Steam.
import { CATALOGO } from '../models/jogo';

export function slugify(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[™®©]/g, '')
    .replace(/['’`]/g, '')
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

let porAppid: Map<number, string> | null = null;
let porSlug: Map<string, number> | null = null;

// monta os dois mapas uma única vez
function montar(): void {
  if (porAppid && porSlug) return;
  const a = new Map<number, string>();
  const s = new Map<string, number>();

  for (const jogo of CATALOGO) {
    if (a.has(jogo.appid)) continue;
    let slug = slugify(jogo.nome) || String(jogo.appid);
    if (s.has(slug)) slug = `${slug}-${jogo.appid}`; // dois jogos com o mesmo nome
    a.set(jogo.appid, slug);
    s.set(slug, jogo.appid);
  }

  porAppid = a;
  porSlug = s;
}

/** appid -> "nome-do-jogo". Se não achar no catálogo, devolve o próprio número. */
export function slugDoAppid(appid: number | string): string {
  montar();
  return porAppid!.get(Number(appid)) ?? String(appid);
}

/** "nome-do-jogo" (ou o número antigo) -> appid. Devolve null se o jogo não existe. */
export function appidDoSlug(parametro: string): number | null {
  montar();
  let texto = parametro ?? '';
  try {
    texto = decodeURIComponent(texto);
  } catch {
    /* mantém o texto original */
  }
  texto = texto.trim().toLowerCase();
  if (!texto) return null;

  if (/^\d+$/.test(texto)) {
    const id = Number(texto);
    return porAppid!.has(id) ? id : null;
  }
  return porSlug!.get(texto) ?? null;
}