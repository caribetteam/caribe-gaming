import { CATALOGO } from "./jogo"; // ajuste o caminho/nome do seu arquivo

// Teste 2 faz ~545 chamadas à Steam (~15 min). Deixe false no dia a dia.
const RODAR_STEAM = true;
// Em Karma (navegador) a Steam bloqueia por CORS. Use um runner em Node (Vitest/Jest)
// ou troque por uma rota do seu back em localhost:3000 que repasse a chamada.
const STEAM_URL = (id: number) =>
  `https://store.steampowered.com/api/appdetails?appids=${id}&cc=br&l=english`;

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[™®©]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

function similaridade(a: string, b: string): number {
  const A = new Set(norm(a).split(' ').filter(Boolean));
  const B = new Set(norm(b).split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((w) => B.has(w) && inter++);
  return inter / Math.min(A.size, B.size);
}

describe('CATALOGO - appids', () => {
  it('não repete o mesmo appid para jogos diferentes', () => {
    const porId = new Map<number, Set<string>>();
    for (const j of CATALOGO) {
      if (!porId.has(j.appid)) porId.set(j.appid, new Set());
      porId.get(j.appid)!.add(j.nome);
    }
    const conflitos = [...porId.entries()]
      .filter(([, nomes]) => nomes.size > 1)
      .map(([appid, nomes]) => ({ appid, nomes: [...nomes] }));

    if (conflitos.length) console.log('IDs compartilhados:\n' + JSON.stringify(conflitos, null, 2));
    expect(conflitos).toEqual([]);
  });

  it('appid bate com o nome na API da Steam', async () => {
    if (!RODAR_STEAM) return;

    const problemas: { appid: number; catalogo: string; steam: string | null; status: string }[] = [];
    const vistos = new Set<number>();

    for (const j of CATALOGO) {
      if (vistos.has(j.appid)) continue;
      vistos.add(j.appid);

      const res = await fetch(STEAM_URL(j.appid));
      const json = await res.json();
      const d = json?.[j.appid];

      if (!d?.success) {
        problemas.push({ appid: j.appid, catalogo: j.nome, steam: null, status: 'ID_NAO_EXISTE_OU_REMOVIDO' });
      } else if (d.data.type !== 'game') {
        problemas.push({ appid: j.appid, catalogo: j.nome, steam: d.data.name, status: `TIPO_${d.data.type}` });
      } else if (similaridade(j.nome, d.data.name) < 0.6) {
        problemas.push({ appid: j.appid, catalogo: j.nome, steam: d.data.name, status: 'NOME_DIFERENTE' });
      }
      await new Promise((r) => setTimeout(r, 1600)); // evita bloqueio da Steam
    }

    console.log('IDs com problema:\n' + JSON.stringify(problemas, null, 2));
    expect(problemas).toEqual([]);
  }, 20 * 60 * 1000);
});
