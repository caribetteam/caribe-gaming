// exportar-repo.mjs
// Gera repo-parte-1.txt, repo-parte-2.txt... com a árvore de pastas e o código do projeto.
// Uso (na raiz do repositório): node exportar-repo.mjs   (Node 18 ou superior)

import { promises as fs } from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd();
const LIMITE_POR_PARTE = 150_000;    // caracteres por arquivo de saída
const TAMANHO_MAX_ARQUIVO = 100_000; // bytes; arquivos maiores são omitidos

const PASTAS_IGNORADAS = new Set([
  'node_modules', '.git', 'dist', '.angular', '.vercel', 'coverage',
  '.next', 'out', '.cache', '.firebase', '.turbo', '.idea',
  '.agents', // cópia real das "skills" de agentes de IA (os links das outras pastas apontam para cá)
]);
const ARQUIVOS_IGNORADOS = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
]);
const EXTENSOES_IGNORADAS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.pdf', '.zip',
]);
// Únicos arquivos .env* que podem entrar (só servem para mostrar os NOMES das variáveis).
const ENV_PERMITIDOS = new Set(['.env.example', '.env.sample', '.env.template']);

// Itens que ficaram de fora e por quê (aparece no topo da parte 1 e no terminal).
const omitidos = [];
let pastasSoComLinks = 0;

const rel = (p) => path.relative(RAIZ, p).split(path.sep).join('/') || '.';

// Mascara JWTs e valores que parecem segredos. Pode mascarar código legítimo
// (ex.: "password: this.form.value.password"); é o preço de errar para o lado seguro.
function mascarar(texto) {
  return texto
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[JWT_MASCARADO]')
    .replace(
      /((?:key|secret|token|password|senha)[\w-]*\s*[:=]\s*)(['"`]?)[^\s'"`,;]{8,}\2/gi,
      '$1$2[MASCARADO]$2'
    );
}

// Verdadeiro se a pasta tem ao menos um arquivo regular (ignora links simbólicos e pastas ignoradas).
async function temArquivos(dir) {
  let entradas;
  try {
    entradas = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const e of entradas) {
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) {
      if (PASTAS_IGNORADAS.has(e.name)) continue;
      if (await temArquivos(path.join(dir, e.name))) return true;
    } else if (e.isFile()) {
      return true;
    }
  }
  return false;
}

// Monta a árvore de pastas e junta a lista de arquivos regulares.
async function percorrer(dir, prefixo, arvore, arquivos) {
  let entradas;
  try {
    entradas = await fs.readdir(dir, { withFileTypes: true });
  } catch (erro) {
    omitidos.push([rel(dir), `pasta ilegível (${erro.code})`]);
    return;
  }

  entradas.sort(
    (a, b) => (b.isDirectory() - a.isDirectory()) || a.name.localeCompare(b.name)
  );

  const visiveis = [];
  for (const e of entradas) {
    if (e.name.startsWith('repo-parte-') || e.name === 'exportar-repo.mjs') continue;
    if (e.isDirectory()) {
      if (PASTAS_IGNORADAS.has(e.name)) continue;
      if (!(await temArquivos(path.join(dir, e.name)))) {
        pastasSoComLinks++; // pasta só com links simbólicos (ou vazia): não vale listar
        continue;
      }
    }
    visiveis.push(e);
  }

  for (const [i, e] of visiveis.entries()) {
    const ultimo = i === visiveis.length - 1;
    const ponteiro = ultimo ? '└── ' : '├── ';
    const caminho = path.join(dir, e.name);

    // Link simbólico: não seguir (pode apontar para pasta, causar loop ou sair do repositório).
    if (e.isSymbolicLink()) {
      arvore.push(`${prefixo}${ponteiro}${e.name}  [link simbólico, ignorado]`);
      omitidos.push([rel(caminho), 'link simbólico']);
      continue;
    }

    arvore.push(`${prefixo}${ponteiro}${e.name}`);

    if (e.isDirectory()) {
      await percorrer(caminho, prefixo + (ultimo ? '    ' : '│   '), arvore, arquivos);
    } else if (e.isFile()) {
      arquivos.push(caminho);
    } else {
      omitidos.push([rel(caminho), 'tipo especial de arquivo']);
    }
  }
}

const arvore = [];
const arquivos = [];
await percorrer(RAIZ, '', arvore, arquivos);

if (pastasSoComLinks > 0) {
  omitidos.push([
    `${pastasSoComLinks} pasta(s)`,
    'só com links simbólicos ou vazias (ex.: skills de agentes de IA), ignoradas',
  ]);
}

const blocos = [];
for (const caminho of arquivos) {
  const nome = path.basename(caminho);
  const relativo = rel(caminho);

  if (nome.startsWith('.env') && !ENV_PERMITIDOS.has(nome)) {
    omitidos.push([relativo, 'arquivo de segredos (.env), conteúdo não lido']);
    continue;
  }
  if (ARQUIVOS_IGNORADOS.has(nome)) continue;
  if (EXTENSOES_IGNORADAS.has(path.extname(nome).toLowerCase())) continue;

  try {
    const { size } = await fs.stat(caminho);
    if (size > TAMANHO_MAX_ARQUIVO) {
      omitidos.push([relativo, `arquivo grande (${size} bytes)`]);
      continue;
    }

    const buffer = await fs.readFile(caminho);
    if (buffer.includes(0)) { // byte nulo = arquivo binário
      omitidos.push([relativo, 'arquivo binário']);
      continue;
    }

    blocos.push(`\n===== ${relativo} =====\n${mascarar(buffer.toString('utf8'))}\n`);
  } catch (erro) {
    omitidos.push([relativo, `erro de leitura (${erro.code ?? erro.message})`]);
  }
}

// A primeira parte começa com a árvore e a lista de itens omitidos.
let cabecalho = `ESTRUTURA DO PROJETO\n${path.basename(RAIZ)}/\n${arvore.join('\n')}\n`;
if (omitidos.length > 0) {
  cabecalho += `\nITENS OMITIDOS\n${omitidos.map(([p, motivo]) => `- ${p}: ${motivo}`).join('\n')}\n`;
}

// Divide em partes de tamanho controlado.
const partes = [];
let atual = cabecalho;
for (const bloco of blocos) {
  if (atual.length + bloco.length > LIMITE_POR_PARTE && atual.length > 0) {
    partes.push(atual);
    atual = '';
  }
  atual += bloco;
}
partes.push(atual);

for (const [i, parte] of partes.entries()) {
  await fs.writeFile(`repo-parte-${i + 1}.txt`, `PARTE ${i + 1} DE ${partes.length}\n${parte}`);
}

console.log(`${arquivos.length} arquivos varridos, ${partes.length} parte(s) gerada(s).`);
if (omitidos.length > 0) {
  console.log(`\n${omitidos.length} item(ns) omitido(s):`);
  for (const [p, motivo] of omitidos) console.log(`  - ${p}: ${motivo}`);
}
console.log('\nRevise os arquivos repo-parte-*.txt antes de enviar e apague-os depois.');