// src/app/core/models/jogo.ts

export interface Comentario {
  id: number;
  autor: string;
  avatar: string;
  corAvatar?: string;
  estrelas: number;
  texto: string;
  data: string;
  likes: number;
  dislikes: number;
  votouLike?: boolean;
  votouDislike?: boolean;
}

export interface DetalhesJogo {
  id: number | string;
  nome: string;
  descricao: string;
  dataLancamento: string;
  desenvolvedoras: string;
  distribuidoras: string;
  classificacaoEtaria?: string;
  plataformas: string;
  background_image?: string;
  slug?: string;

  // campos novos (opcionais para as páginas antigas continuarem compilando)
  generos?: string;
  imagens?: string[];
  capa?: string;
  requisitos?: { minimos: string | null; recomendados: string | null };
  gratis?: boolean;
  estoque?: boolean;
  preco?: {
    atual: string;
    original: string | null;
    desconto: number;
    valor: number;
  } | null;
  avaliacao?: { nota: string; total: number } | null;
  caracteristicas?: string[];
  dlcIds?: number[];
}

export interface Produto {
  id: string;
  nome: string;
  steamAppId?: string;
  genero: string;
  plataforma: string;
  precoOriginal: string;
  precoPromocional: string;
  precoNumero?: number;
  desconto: number | string;
  categorias: string[];
  slug?: string;
  imagem?: string;
  imagemPosicao?: string;
  descricaoCustom?: string;
  favorito?: boolean;
  estoque?: boolean;
}

export interface JogoCard {
  id: number;
  nome: string;
  slug: string;
  capa: string;
  plataformas: string[];
  generos: string[];
  categorias: string[];
  gratis: boolean;
  estoque: boolean;
  preco: {
    atual: string;
    original: string | null;
    desconto: number;
    valor: number;
  } | null;
}

export interface JogoCatalogo {
  appid: number;
  nome: string;
  plataformas: string[];
  generos: string[];
  categorias: string[];
  gratis?: boolean;
  estoque?: boolean;
  capa?: string; // opcional: capa manual (ex.: '/capas/f1-25.jpg'). Se existir, vale mais que a da Steam.
}

export interface Dlc {
  id: number;
  nome: string;
  imagem: string;
  gratis: boolean;
  preco: {
    atual: string;
    original: string | null;
    desconto: number;
    valor: number;
  } | null;
}

export const CATALOGO: JogoCatalogo[] = [
  { appid: 	3240220,  nome: 'Grand Theft Auto V', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 292030,  nome: 'The Witcher 3: Wild Hunt', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },
 
  { appid: 1593500, nome: 'God of War', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1817070, nome: "Marvel's Spider-Man Remastered", plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 2519060, nome: 'Call of Duty: Modern Warfare III', plataformas: ['PC', 'PS'], generos: ['Tiro', 'FPS'], categorias: ['shooter', 'action'] },
  { appid: 752590,  nome: 'A Plague Tale: Innocence', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Mistério'], categorias: ['adventure'] },
  { appid: 2322010, nome: 'God of War Ragnarök', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 367520,  nome: 'Hollow Knight', plataformas: ['PC'], generos: ['Metroidvania'], categorias: ['platform', 'indie'] },
  { appid: 1174180, nome: 'Red Dead Redemption 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 242050,  nome: "Assassin's Creed IV Black Flag", plataformas: ['PC'], generos: ['Ação'], categorias: ['action', 'adventure'] },
  { appid: 2988580,  nome: "Yakuza 0 Director's Cut", plataformas: ['PC'], generos: ['Ação', 'Luta'], categorias: ['action', 'adventure'] },
  { appid: 4080220, nome: 'EA SPORTS FC™ 27', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },
  { appid: 1265920,  nome: 'Life is Strange Remastered', plataformas: ['PC'], generos: ['História Interativa'], categorias: ['adventure'] },
  { appid: 1888930, nome: 'The Last of Us Part I', plataformas: ['PC', 'PS'], generos: ['Ação', 'Sobrevivência'], categorias: ['action', 'adventure'], estoque: false },
  // Se a capa do F1 25 não carregar sozinha, salve a imagem em public/capas/f1-25.jpg e acrescente: capa: '/capas/f1-25.jpg'
  { appid: 3059520, nome: 'F1® 25', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing', 'sport'] },
  { appid: 1245620, nome: 'Elden Ring', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1091500, nome: 'Cyberpunk 2077', plataformas: ['PC'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 2531310, nome: 'The Last of Us Part II Remastered', plataformas: ['PC', 'PS'], generos: ['Ação', 'Sobrevivência'], categorias: ['action', 'adventure'] },

  { appid: 1086940, nome: "Baldur's Gate 3", plataformas: ['PC', 'PS'], generos: ['RPG', 'Estratégia'], categorias: ['role-playing-rpg', 'strategy'] },
  { appid: 990080, nome: 'Hogwarts Legacy', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 489830, nome: 'The Elder Scrolls V: Skyrim Special Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 374320, nome: 'DARK SOULS™ III', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 570940, nome: 'DARK SOULS™ REMASTERED', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1151640, nome: 'Horizon Zero Dawn™ Complete Edition', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 2420110, nome: 'Horizon Forbidden West™ Complete Edition', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1774580, nome: 'STARFIELD', plataformas: ['PC'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 2054970, nome: "Dragon's Dogma 2", plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1144200, nome: 'Final Fantasy VII Remake Intergrade', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1687950, nome: 'Persona 5 Royal', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 2161700, nome: 'Persona 3 Reload', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 1196590, nome: 'Yakuza: Like a Dragon', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 2072450, nome: 'Like a Dragon: Infinite Wealth', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 377160, nome: 'Fallout 4', plataformas: ['PC', 'PS'], generos: ['RPG', 'Pós-Apocalíptico'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1172380, nome: 'Star Wars Jedi: Fallen Order™', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1770300, nome: 'STAR WARS Jedi: Survivor™', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 2050650, nome: 'Resident Evil 4 (Remake)', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Ação'], categorias: ['action', 'adventure'] },
  { appid: 883710, nome: 'Resident Evil 2 (Remake)', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Ação'], categorias: ['action', 'adventure'] },
  { appid: 1196590, nome: 'Resident Evil Village', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'FPS'], categorias: ['action', 'shooter'] },
  { appid: 2124490, nome: 'SILENT HILL 2', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Mistério'], categorias: ['adventure', 'action'] },
  { appid: 553850, nome: 'HELLDIVERS™ 2', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Cooperativo'], categorias: ['shooter', 'action'] },
  { appid: 1677740, nome: 'Stray', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Indie'], categorias: ['adventure', 'indie'] },
  { appid: 2715900, nome: 'Black Myth: Wukong', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1817190, nome: "Marvel's Spider-Man: Miles Morales", plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1659420, nome: 'UNCHARTED™: Legacy of Thieves Collection', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 582010, nome: 'Monster Hunter: World', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },

  // 46-70 (Aventura, Sobrevivência e Indies Pagos)
  { appid: 2246340, nome: 'Monster Hunter Wilds', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1446780, nome: 'MONSTER HUNTER RISE', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1235140, nome: 'Like a Dragon: Ishin!', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1623730, nome: 'Palworld', plataformas: ['PC'], generos: ['Sobrevivência', 'Mundo Aberto'], categorias: ['adventure', 'indie'] },
  { appid: 108600, nome: 'Project Zomboid', plataformas: ['PC'], generos: ['Sobrevivência', 'Zumbis'], categorias: ['indie', 'simulation'] },
  { appid: 252490, nome: 'Rust', plataformas: ['PC'], generos: ['Sobrevivência', 'Multiplayer'], categorias: ['action', 'indie'] },
  { appid: 105600, nome: 'Terraria', plataformas: ['PC'], generos: ['Sandbox', 'Sobrevivência'], categorias: ['indie', 'adventure'] },
  { appid: 1145360, nome: 'Hades', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 1145350, nome: 'Hades II', plataformas: ['PC'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 268910, nome: 'Cuphead', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 504230, nome: 'Celeste', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Indie'], categorias: ['platform', 'indie'] },
  { appid: 413150, nome: 'Stardew Valley', plataformas: ['PC', 'PS'], generos: ['Simulação', 'RPG'], categorias: ['simulation', 'indie'] },
  { appid: 281990, nome: 'Stellaris', plataformas: ['PC'], generos: ['Estratégia', 'Sci-Fi'], categorias: ['strategy'] },
  { appid: 289070, nome: "Sid Meier's Civilization® VI", plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 1366540, nome: "Sid Meier's Civilization® VII", plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 381210, nome: 'Dead by Daylight', plataformas: ['PC', 'PS'], generos: ['Horror', 'Multiplayer'], categorias: ['action', 'indie'] },
  { appid: 262060, nome: 'Darkest Dungeon®', plataformas: ['PC', 'PS'], generos: ['Turnos', 'Roguelike'], categorias: ['indie', 'strategy'] },
  { appid: 646570, nome: 'Slay the Spire', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Cartas'], categorias: ['indie', 'strategy'] },
  { appid: 1942280, nome: 'Brotato', plataformas: ['PC'], generos: ['Roguelike', 'Casual'], categorias: ['indie', 'action'] },
  { appid: 1790600, nome: 'Deep Rock Galactic: Survivor', plataformas: ['PC'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 548430, nome: 'Deep Rock Galactic', plataformas: ['PC', 'PS'], generos: ['FPS', 'Cooperativo'], categorias: ['shooter', 'action'] },
  { appid: 252490, nome: 'Dead Cells', plataformas: ['PC', 'PS'], generos: ['Metroidvania', 'Roguelike'], categorias: ['action', 'indie'] },
  { appid: 250900, nome: 'The Binding of Isaac: Rebirth', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Indie'], categorias: ['action', 'indie'] },
  { appid: 391540, nome: 'Undertale', plataformas: ['PC', 'PS'], generos: ['RPG', 'Indie'], categorias: ['role-playing-rpg', 'indie'] },
  { appid: 108700, nome: 'Alan Wake 2', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Mistério'], categorias: ['action', 'adventure'] },

  // 71-100 (Simuladores, Corrida e Outros Clássicos Pagos)
  { appid: 1551360, nome: 'Forza Horizon 5', plataformas: ['PC'], generos: ['Corrida', 'Mundo Aberto'], categorias: ['racing', 'sport'] },
  { appid: 1293830, nome: 'Forza Horizon 4', plataformas: ['PC'], generos: ['Corrida', 'Mundo Aberto'], categorias: ['racing', 'sport'] },
  { appid: 244210, nome: 'Assetto Corsa', plataformas: ['PC'], generos: ['Corrida', 'Simulação'], categorias: ['racing', 'simulation'] },
  { appid: 805550, nome: 'Assetto Corsa Competizione', plataformas: ['PC', 'PS'], generos: ['Corrida', 'Simulação'], categorias: ['racing', 'simulation'] },
  { appid: 227300, nome: 'Euro Truck Simulator 2', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 270880, nome: 'American Truck Simulator', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 1250410, nome: 'Microsoft Flight Simulator', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 2537590, nome: 'Microsoft Flight Simulator 2024', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 255710, nome: 'Cities: Skylines', plataformas: ['PC'], generos: ['Simulação', 'Construção'], categorias: ['simulation', 'strategy'] },
  { appid: 949230, nome: 'Cities: Skylines II', plataformas: ['PC'], generos: ['Simulação', 'Construção'], categorias: ['simulation', 'strategy'] },
  { appid: 1222670, nome: 'Need for Speed™ Unbound', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing'] },
  { appid: 1846380, nome: 'Need for Speed™ Heat', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing'] },
  { appid: 1237970, nome: 'Titanfall® 2', plataformas: ['PC', 'PS'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 1237950, nome: 'Battlefield™ V', plataformas: ['PC', 'PS'], generos: ['FPS', 'Guerra'], categorias: ['shooter', 'action'] },
  { appid: 1517290, nome: 'Battlefield™ 2042', plataformas: ['PC', 'PS'], generos: ['FPS', 'Guerra'], categorias: ['shooter', 'action'] },
  { appid: 1506830, nome: 'EA SPORTS™ FIFA 23', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },
  { appid: 2195250, nome: 'EA SPORTS FC™ 24', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },
  { appid: 2669320, nome: 'EA SPORTS FC™ 25', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },
  { appid: 892970, nome: 'Valheim', plataformas: ['PC'], generos: ['Sobrevivência', 'Mundo Aberto'], categorias: ['indie', 'action'] },
  { appid: 275850, nome: 'No Man\'s Sky', plataformas: ['PC', 'PS'], generos: ['Mundo Aberto', 'Sci-Fi'], categorias: ['adventure', 'action'] },
  { appid: 1966720, nome: 'Lethal Company', plataformas: ['PC'], generos: ['Horror', 'Cooperativo'], categorias: ['indie', 'action'] },
  { appid: 739630, nome: 'Phasmophobia', plataformas: ['PC', 'PS'], generos: ['Horror', 'Cooperativo'], categorias: ['indie', 'action'] },
  { appid: 48000, nome: 'LIMBO', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Puzzle'], categorias: ['indie', 'platform'] },
  { appid: 270150, nome: 'INSIDE', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Puzzle'], categorias: ['indie', 'platform'] },
  { appid: 1057090, nome: 'Ori and the Will of the Wisps', plataformas: ['PC'], generos: ['Metroidvania', 'Plataforma'], categorias: ['platform', 'indie'] },
  { appid: 261550, nome: 'Mount & Blade II: Bannerlord', plataformas: ['PC', 'PS'], generos: ['RPG', 'Estratégia'], categorias: ['role-playing-rpg', 'strategy'] },
  { appid: 1172620, nome: 'Sea of Thieves', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Mundo Aberto'], categorias: ['adventure', 'action'] },
  { appid: 578080, nome: 'PUBG: BATTLEGROUNDS (Premium/Legacy)', plataformas: ['PC', 'PS'], generos: ['Battle Royale', 'FPS'], categorias: ['shooter', 'action'] },
  { appid: 1938090, nome: 'Call of Duty®: Modern Warfare® II', plataformas: ['PC', 'PS'], generos: ['Tiro', 'FPS'], categorias: ['shooter', 'action'] },
  { appid: 1240440, nome: 'Halo Infinite (Campanha)', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
];