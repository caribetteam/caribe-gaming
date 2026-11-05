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
  // ================= JOGOS COM SEQUÊNCIA (por franquia, em ordem) =================

  // --- Age of Empires / Mythology ---
  { appid: 221380, nome: 'Age of Empires II: Definitive Edition', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },
  { appid: 933110, nome: 'Age of Mythology: Retold', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },

  // --- Age of Wonders ---
  { appid: 718850, nome: 'Age of Wonders: Planetfall', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 226840, nome: 'Age of Wonders III', plataformas: ['PC'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },

  // --- Alan Wake ---
  { appid: 202750, nome: 'Alan Wake\'s American Nightmare', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Mistério'], categorias: ['action', 'adventure'] },
  { appid: 108710, nome: 'Alan Wake', plataformas: ['PC'], generos: ['Ação', 'Mistério'], categorias: ['action', 'adventure'] },

  // --- Alien ---
  { appid: 1549970, nome: 'Aliens: Fireteam Elite', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Cooperativo'], categorias: ['shooter', 'action'] },
  { appid: 214490, nome: 'Alien: Isolation', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Sci-Fi'], categorias: ['adventure', 'action'] },

  // --- Amnesia ---
  { appid: 57300, nome: 'Amnesia: The Dark Descent', plataformas: ['PC', 'PS'], generos: ['Horror Psicológico'], categorias: ['indie', 'adventure'] },
  { appid: 999220, nome: 'Amnesia: Rebirth', plataformas: ['PC', 'PS'], generos: ['Horror Psicológico'], categorias: ['indie', 'adventure'] },
  { appid: 1944430, nome: 'Amnesia: The Bunker', plataformas: ['PC', 'PS'], generos: ['Horror', 'Sobrevivência'], categorias: ['indie', 'adventure'] },
  { appid: 359390, nome: 'Amnesia: Memories', plataformas: ['PC'], generos: ['Visual Novel'], categorias: ['adventure', 'casual'] },

  // --- Assassin's Creed ---
  { appid: 2208920, nome: 'Assassin\'s Creed Valhalla', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 812140, nome: 'Assassin\'s Creed Odyssey', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 582160, nome: 'Assassin\'s Creed Origins', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 48190, nome: 'Assassin\'s Creed® Brotherhood', plataformas: ['PC'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 201870, nome: 'Assassin\'s Creed® Revelations', plataformas: ['PC'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 289650, nome: 'Assassin\'s Creed® Unity', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 368500, nome: 'Assassin\'s Creed® Syndicate', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 3159330, nome: 'Assassin\'s Creed® Shadows', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 911400, nome: 'Assassin\'s Creed® III Remastered', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 242050, nome: 'Assassin\'s Creed IV Black Flag', plataformas: ['PC'], generos: ['Ação'], categorias: ['action', 'adventure'] },

  // --- Assetto Corsa ---
  { appid: 244210, nome: 'Assetto Corsa', plataformas: ['PC'], generos: ['Corrida', 'Simulação'], categorias: ['racing', 'simulation'] },
  { appid: 805550, nome: 'Assetto Corsa Competizione', plataformas: ['PC', 'PS'], generos: ['Corrida', 'Simulação'], categorias: ['racing', 'simulation'] },

  // --- Battlefield ---
  { appid: 1517290, nome: 'Battlefield™ 2042', plataformas: ['PC', 'PS'], generos: ['FPS', 'Guerra'], categorias: ['shooter', 'action'] },
  { appid: 1237950, nome: 'Battlefield™ V', plataformas: ['PC', 'PS'], generos: ['FPS', 'Guerra'], categorias: ['shooter', 'action'] },

  // --- BioShock ---
  { appid: 409720, nome: 'BioShock™ Remastered', plataformas: ['PC', 'PS'], generos: ['FPS', 'Horror'], categorias: ['shooter', 'action'] },
  { appid: 8870, nome: 'BioShock Infinite', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },
  { appid: 40970, nome: 'BioShock™ 2 Remastered', plataformas: ['PC', 'PS'], generos: ['FPS', 'Horror'], categorias: ['shooter', 'action'] },

  // --- Blasphemous ---
  { appid: 774361, nome: 'Blasphemous', plataformas: ['PC', 'PS'], generos: ['Metroidvania', 'Souls-like'], categorias: ['action', 'indie'] },
  { appid: 1659200, nome: 'Blasphemous 2', plataformas: ['PC', 'PS'], generos: ['Metroidvania', 'Souls-like'], categorias: ['action', 'indie'] },

  // --- Call of Duty ---
  { appid: 1985810, nome: 'Call of Duty®: Black Ops Cold War', plataformas: ['PC', 'PS'], generos: ['FPS', 'Tiro'], categorias: ['shooter', 'action'] },
  { appid: 1938070, nome: 'Call of Duty®: Vanguard', plataformas: ['PC', 'PS'], generos: ['FPS', 'Tiro'], categorias: ['shooter', 'action'] },
  { appid: 1938090, nome: 'Call of Duty®: Modern Warfare® II', plataformas: ['PC', 'PS'], generos: ['Tiro', 'FPS'], categorias: ['shooter', 'action'] },
  { appid: 2519060, nome: 'Call of Duty: Modern Warfare III', plataformas: ['PC', 'PS'], generos: ['Tiro', 'FPS'], categorias: ['shooter', 'action'] },
  { appid: 2933620, nome: 'Call of Duty®: Black Ops 6', plataformas: ['PC', 'PS'], generos: ['FPS', 'Tiro'], categorias: ['shooter', 'action'] },

  // --- Car Mechanic ---
  { appid: 1210320, nome: 'Car Mechanic Simulator 2021', plataformas: ['PC', 'PS'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 645630, nome: 'Car Mechanic Simulator 2018', plataformas: ['PC', 'PS'], generos: ['Simulação'], categorias: ['simulation'] },

  // --- Cities: Skylines ---
  { appid: 255710, nome: 'Cities: Skylines', plataformas: ['PC'], generos: ['Simulação', 'Construção'], categorias: ['simulation', 'strategy'] },
  { appid: 949230, nome: 'Cities: Skylines II', plataformas: ['PC'], generos: ['Simulação', 'Construção'], categorias: ['simulation', 'strategy'] },

  // --- Conan ---
  { appid: 593030, nome: 'Conan Exiles', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Mundo Aberto'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 440900, nome: 'Conan Unconquered', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },

  // --- Counter-Strike ---
  { appid: 240, nome: 'Counter-Strike: Source', plataformas: ['PC'], generos: ['FPS', 'Tático'], categorias: ['shooter', 'action'] },
  { appid: 10, nome: 'Counter-Strike (1.6)', plataformas: ['PC'], generos: ['FPS', 'Tático'], categorias: ['shooter', 'action'] },
  { appid: 80, nome: 'Counter-Strike: Condition Zero', plataformas: ['PC'], generos: ['FPS', 'Tático'], categorias: ['shooter', 'action'] },

  // --- Crusader Kings / Paradox ---
  { appid: 281990, nome: 'Stellaris', plataformas: ['PC'], generos: ['Estratégia', 'Sci-Fi'], categorias: ['strategy'] },
  { appid: 236870, nome: 'Europa Universalis IV: Extreme Edition', plataformas: ['PC'], generos: ['Estratégia'], categorias: ['strategy'] },
  { appid: 1158310, nome: 'Crusader Kings III', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'RPG'], categorias: ['strategy', 'simulation'] },
  { appid: 394360, nome: 'Hearts of Iron IV', plataformas: ['PC'], generos: ['Estratégia', 'Guerra'], categorias: ['strategy'] },
  { appid: 236850, nome: 'Europa Universalis IV', plataformas: ['PC'], generos: ['Estratégia'], categorias: ['strategy'] },

  // --- Dark Souls ---
  { appid: 570940, nome: 'DARK SOULS™ REMASTERED', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 211420, nome: 'DARK SOULS™ Prepare To Die Edition', plataformas: ['PC'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 236430, nome: 'DARK SOULS™ II', plataformas: ['PC'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 374320, nome: 'DARK SOULS™ III', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },

  // --- Dead Island ---
  { appid: 915810, nome: 'Dead Island Definitive Edition', plataformas: ['PC', 'PS'], generos: ['Ação', 'Zumbis'], categorias: ['action', 'adventure'] },
  { appid: 1544020, nome: 'Dead Island 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Zumbis'], categorias: ['action', 'adventure'] },

  // --- Dead Rising ---
  { appid: 455860, nome: 'Dead Rising Deluxe Remaster', plataformas: ['PC', 'PS'], generos: ['Ação', 'Zumbis'], categorias: ['action'] },
  { appid: 211310, nome: 'Dead Rising 3 Apocalypse Edition', plataformas: ['PC'], generos: ['Ação', 'Zumbis'], categorias: ['action'] },
  { appid: 427270, nome: 'Dead Rising 4', plataformas: ['PC', 'PS'], generos: ['Ação', 'Zumbis'], categorias: ['action'] },

  // --- Death Stranding ---
  { appid: 1850570, nome: 'DEATH STRANDING DIRECTOR\'S CUT', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1190460, nome: 'Death Stranding', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },

  // --- Deep Rock Galactic ---
  { appid: 2321470, nome: 'Deep Rock Galactic: Survivor', plataformas: ['PC'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 548430, nome: 'Deep Rock Galactic', plataformas: ['PC', 'PS'], generos: ['FPS', 'Cooperativo'], categorias: ['shooter', 'action'] },

  // --- Deus Ex ---
  { appid: 6910, nome: 'Deus Ex: Game of the Year Edition', plataformas: ['PC'], generos: ['RPG', 'Cyberpunk'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 28050, nome: 'Deus Ex: Human Revolution - Director\'s Cut', plataformas: ['PC'], generos: ['RPG', 'Cyberpunk'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 337000, nome: 'Deus Ex: Mankind Divided', plataformas: ['PC', 'PS'], generos: ['RPG', 'Cyberpunk'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 238010, nome: 'Deus Ex: The Fall', plataformas: ['PC'], generos: ['RPG', 'Cyberpunk'], categorias: ['role-playing-rpg'] },

  // --- DiRT / GRID / WRC ---
  { appid: 310560, nome: 'Dirt Rally', plataformas: ['PC'], generos: ['Corrida', 'Simulação'], categorias: ['racing', 'simulation'] },
  { appid: 254440, nome: 'GRID Autosport', plataformas: ['PC'], generos: ['Corrida'], categorias: ['racing'] },
  { appid: 703860, nome: 'GRID (2019)', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing'] },
  { appid: 1149560, nome: 'GRID Legends', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing'] },
  { appid: 690790, nome: 'DiRT Rally 2.0', plataformas: ['PC', 'PS'], generos: ['Corrida', 'Simulação'], categorias: ['racing', 'simulation'] },

  // --- Dishonored ---
  { appid: 205100, nome: 'Dishonored', plataformas: ['PC', 'PS'], generos: ['Ação', 'Stealth'], categorias: ['action', 'adventure'] },
  { appid: 403640, nome: 'Dishonored 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Stealth'], categorias: ['action', 'adventure'] },

  // --- Divinity ---
  { appid: 323370, nome: 'Divinity: Original Sin - Enhanced Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg', 'strategy'] },
  { appid: 435150, nome: 'Divinity: Original Sin 2 - Definitive Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg', 'strategy'] },

  // --- DOOM / Quake ---
  { appid: 2280, nome: 'DOOM (1993)', plataformas: ['PC', 'PS'], generos: ['FPS', 'Retrô'], categorias: ['shooter', 'action'] },
  { appid: 379720, nome: 'DOOM (2016)', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },
  { appid: 782330, nome: 'DOOM Eternal', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },
  { appid: 2300, nome: 'DOOM II', plataformas: ['PC', 'PS'], generos: ['FPS', 'Retrô'], categorias: ['shooter', 'action'] },
  { appid: 208200, nome: 'Doom 3', plataformas: ['PC', 'PS'], generos: ['FPS', 'Horror'], categorias: ['shooter', 'action'] },
  { appid: 2310, nome: 'Quake III Arena', plataformas: ['PC'], generos: ['FPS', 'Arena'], categorias: ['shooter', 'action'] },

  // --- Dragon Age ---
  { appid: 205650, nome: 'Dragon Age: Origins - Ultimate Edition', plataformas: ['PC'], generos: ['RPG', 'Fantasia'], categorias: ['role-playing-rpg'] },
  { appid: 1222690, nome: 'Dragon Age™ Inquisition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1845910, nome: 'Dragon Age™: The Veilguard', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 47810, nome: 'Dragon Age II', plataformas: ['PC'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },

  // --- Dragon Ball ---
  { appid: 678950, nome: 'Dragon Ball FighterZ', plataformas: ['PC', 'PS'], generos: ['Luta', 'Anime'], categorias: ['action'] },
  { appid: 1790600, nome: 'DRAGON BALL: Sparking! ZERO', plataformas: ['PC', 'PS'], generos: ['Luta', 'Anime'], categorias: ['action'] },
  { appid: 2133080, nome: 'Dragon Ball Z: Kakarot', plataformas: ['PC', 'PS'], generos: ['RPG', 'Anime'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 323470, nome: 'DRAGON BALL XENOVERSE', plataformas: ['PC', 'PS'], generos: ['Luta', 'Anime'], categorias: ['action'] },
  { appid: 454650, nome: 'DRAGON BALL XENOVERSE 2', plataformas: ['PC', 'PS'], generos: ['Luta', 'Anime'], categorias: ['action'] },

  // --- Dying Light ---
  { appid: 239140, nome: 'Dying Light', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Parkour'], categorias: ['action', 'adventure'] },
  { appid: 534380, nome: 'Dying Light 2 Stay Human', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Parkour'], categorias: ['action', 'adventure'] },

  // --- EA SPORTS FC / FIFA ---
  { appid: 1849250, nome: 'EA SPORTS™ WRC', plataformas: ['PC', 'PS'], generos: ['Corrida', 'Simulação'], categorias: ['racing', 'simulation'] },
  { appid: 1506830, nome: 'EA SPORTS™ FIFA 23', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },
  { appid: 2195250, nome: 'EA SPORTS FC™ 24', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },
  { appid: 2669320, nome: 'EA SPORTS FC™ 25', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },
  { appid: 4080220, nome: 'EA SPORTS FC™ 27', plataformas: ['PC', 'PS'], generos: ['Esportes'], categorias: ['sport'] },

  // --- Fallout ---
  { appid: 22380, nome: 'Fallout: New Vegas', plataformas: ['PC'], generos: ['RPG', 'Pós-Apocalíptico'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 22370, nome: 'Fallout 3: Game of the Year Edition', plataformas: ['PC'], generos: ['RPG', 'Pós-Apocalíptico'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 377160, nome: 'Fallout 4', plataformas: ['PC', 'PS'], generos: ['RPG', 'Pós-Apocalíptico'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1151340, nome: 'Fallout 76', plataformas: ['PC', 'PS'], generos: ['RPG', 'Multiplayer'], categorias: ['role-playing-rpg', 'action'] },

  // --- Farming Simulator ---
  { appid: 1248130, nome: 'Farming Simulator 22', plataformas: ['PC', 'PS'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 2231380, nome: 'Farming Simulator 25', plataformas: ['PC', 'PS'], generos: ['Simulação'], categorias: ['simulation'] },

  // --- Final Fantasy ---
  { appid: 280160, nome: 'Final Fantasy XIV: Endwalker (Jogo Base + Expansão)', plataformas: ['PC', 'PS'], generos: ['MMORPG'], categorias: ['role-playing-rpg'] },
  { appid: 1493710, nome: 'Crisis Core –Final Fantasy VII– Reunion', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1144200, nome: 'Final Fantasy VII Remake Intergrade', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 2909400, nome: 'Final Fantasy VII Rebirth', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1462040, nome: 'FINAL FANTASY VII EVER CRISIS', plataformas: ['PC'], generos: ['RPG'], categorias: ['role-playing-rpg'] },
  { appid: 637650, nome: 'FINAL FANTASY XV WINDOWS EDITION', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 2289650, nome: 'Final Fantasy XVI', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },

  // --- Forza ---
  { appid: 1293830, nome: 'Forza Horizon 4', plataformas: ['PC'], generos: ['Corrida', 'Mundo Aberto'], categorias: ['racing', 'sport'] },
  { appid: 1551360, nome: 'Forza Horizon 5', plataformas: ['PC'], generos: ['Corrida', 'Mundo Aberto'], categorias: ['racing', 'sport'] },

  // --- Frostpunk ---
  { appid: 323190, nome: 'Frostpunk', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Sobrevivência'], categorias: ['strategy', 'simulation'] },
  { appid: 1601580, nome: 'Frostpunk 2', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Sobrevivência'], categorias: ['strategy', 'simulation'] },

  // --- Ghostrunner ---
  { appid: 391760, nome: 'Ghostrunner', plataformas: ['PC', 'PS'], generos: ['Ação', 'Cyberpunk'], categorias: ['action', 'indie'] },
  { appid: 2144740, nome: 'Ghostrunner 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Cyberpunk'], categorias: ['action', 'indie'] },

  // --- God of War ---
  { appid: 1593500, nome: 'God of War', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 2322010, nome: 'God of War Ragnarök', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },

  // --- Hades ---
  { appid: 1145360, nome: 'Hades', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 1145350, nome: 'Hades II', plataformas: ['PC'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },

  // --- Half-Life ---
  { appid: 360, nome: 'Half-Life Deathmatch: Source', plataformas: ['PC'], generos: ['FPS'], categorias: ['shooter'] },
  { appid: 280, nome: 'Half-Life: Source', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 130, nome: 'Half-Life: Blue Shift', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 50, nome: 'Half-Life: Opposing Force', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 362890, nome: 'Black Mesa', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 70, nome: 'Half-Life: Counter-Strike (Classic)', plataformas: ['PC'], generos: ['FPS'], categorias: ['shooter'] },
  { appid: 546560, nome: 'Half-Life 2: Episode One', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 420, nome: 'Half-Life 2: Episode Two', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 380, nome: 'Half-Life 2: Deathmatch', plataformas: ['PC'], generos: ['FPS', 'Action'], categorias: ['shooter', 'action'] },
  { appid: 220, nome: 'Half-Life 2: Update', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },

  // --- Helldivers ---
  { appid: 394510, nome: 'HELLDIVERS™ Dive Harder Edition', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Cooperativo'], categorias: ['shooter', 'action'] },
  { appid: 553850, nome: 'HELLDIVERS™ 2', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Cooperativo'], categorias: ['shooter', 'action'] },

  // --- Hotline Miami ---
  { appid: 219150, nome: 'Hotline Miami', plataformas: ['PC', 'PS'], generos: ['Ação', 'Indie'], categorias: ['action', 'indie'] },
  { appid: 233450, nome: 'Hotline Miami (Special Edition)', plataformas: ['PC'], generos: ['Ação', 'Indie'], categorias: ['action', 'indie'] },
  { appid: 274190, nome: 'Hotline Miami 2: Wrong Number', plataformas: ['PC', 'PS'], generos: ['Ação', 'Indie'], categorias: ['action', 'indie'] },

  // --- House Flipper ---
  { appid: 613100, nome: 'House Flipper', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Casual'], categorias: ['simulation', 'casual'] },
  { appid: 1515220, nome: 'House Flipper 2', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Casual'], categorias: ['simulation', 'casual'] },

  // --- Kingdom Come ---
  { appid: 594650, nome: 'Kingdom Come: Deliverance', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 1771300, nome: 'Kingdom Come: Deliverance II', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },

  // --- Left 4 Dead ---
  { appid: 500, nome: 'Left 4 Dead', plataformas: ['PC'], generos: ['FPS', 'Cooperativo'], categorias: ['shooter', 'action'] },
  { appid: 550, nome: 'Left 4 Dead 2', plataformas: ['PC'], generos: ['FPS', 'Cooperativo'], categorias: ['shooter', 'action'] },

  // --- Life is Strange ---
  { appid: 1265920, nome: 'Life is Strange Remastered', plataformas: ['PC'], generos: ['História Interativa'], categorias: ['adventure'] },
  { appid: 319630, nome: 'Life is Strange (Episódios 1-5)', plataformas: ['PC', 'PS'], generos: ['História Interativa'], categorias: ['adventure'] },
  { appid: 554620, nome: 'Life is Strange: Before the Storm', plataformas: ['PC', 'PS'], generos: ['História Interativa'], categorias: ['adventure'] },
  { appid: 2020930, nome: 'Life is Strange: Double Exposure', plataformas: ['PC', 'PS'], generos: ['História Interativa'], categorias: ['adventure'] },
  { appid: 532210, nome: 'Life is Strange 2', plataformas: ['PC', 'PS'], generos: ['História Interativa'], categorias: ['adventure'] },

  // --- Little Nightmares ---
  { appid: 424840, nome: 'Little Nightmares', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Horror'], categorias: ['platform', 'indie'] },
  { appid: 860510, nome: 'Little Nightmares II', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Horror'], categorias: ['platform', 'indie'] },
  { appid: 1392860, nome: 'Little Nightmares III', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Horror'], categorias: ['platform', 'indie'] },

  // --- Mass Effect ---
  { appid: 17420, nome: 'Mass Effect 1 (Classic)', plataformas: ['PC'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1328670, nome: 'Mass Effect™ Legendary Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1238000, nome: 'Mass Effect™ Andromeda', plataformas: ['PC', 'PS'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 236250, nome: 'Mass Effect 2 (Classic)', plataformas: ['PC'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'action'] },

  // --- Max Payne ---
  { appid: 12150, nome: 'Max Payne', plataformas: ['PC'], generos: ['Ação', 'Tiro'], categorias: ['action', 'shooter'] },
  { appid: 12140, nome: 'Max Payne 2: The Fall of Max Payne', plataformas: ['PC'], generos: ['Ação', 'Tiro'], categorias: ['action', 'shooter'] },
  { appid: 110800, nome: 'Max Payne 3', plataformas: ['PC'], generos: ['Ação', 'Tiro'], categorias: ['action', 'shooter'] },

  // --- Metal Gear ---
  { appid: 287700, nome: 'METAL GEAR SOLID V: THE PHANTOM PAIN', plataformas: ['PC', 'PS'], generos: ['Ação', 'Stealth'], categorias: ['action', 'adventure'] },
  { appid: 235460, nome: 'METAL GEAR RISING: REVENGEANCE', plataformas: ['PC'], generos: ['Hack and Slash', 'Ação'], categorias: ['action'] },

  // --- Metro ---
  { appid: 1000100, nome: 'Metro Exodus', plataformas: ['PC', 'PS'], generos: ['FPS', 'Pós-Apocalíptico'], categorias: ['shooter', 'action'] },
  { appid: 286690, nome: 'Metro 2033 Redux', plataformas: ['PC', 'PS'], generos: ['FPS', 'Pós-Apocalíptico'], categorias: ['shooter', 'action'] },

  // --- Monster Hunter ---
  { appid: 582010, nome: 'Monster Hunter: World', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 2246340, nome: 'Monster Hunter Wilds', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1446780, nome: 'MONSTER HUNTER RISE', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },

  // --- Mortal Kombat ---
  { appid: 1971870, nome: 'Mortal Kombat 1', plataformas: ['PC', 'PS'], generos: ['Luta'], categorias: ['action'] },
  { appid: 976310, nome: 'Mortal Kombat 11', plataformas: ['PC', 'PS'], generos: ['Luta'], categorias: ['action'] },

  // --- Mount & Blade ---
  { appid: 261550, nome: 'Mount & Blade II: Bannerlord', plataformas: ['PC', 'PS'], generos: ['RPG', 'Estratégia'], categorias: ['role-playing-rpg', 'strategy'] },
  { appid: 48700, nome: 'Mount & Blade: Warband', plataformas: ['PC'], generos: ['RPG', 'Estratégia'], categorias: ['role-playing-rpg', 'strategy'] },

  // --- Naruto ---
  { appid: 349040, nome: 'NARUTO SHIPPUDEN: Ultimate Ninja STORM 4', plataformas: ['PC', 'PS'], generos: ['Luta', 'Anime'], categorias: ['action'] },
  { appid: 1203220, nome: 'NARUTO X BORUTO Ultimate Ninja STORM CONNECTIONS', plataformas: ['PC', 'PS'], generos: ['Luta', 'Anime'], categorias: ['action'] },

  // --- Need for Speed ---
  { appid: 1846380, nome: 'Need for Speed™ Unbound', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing'] },
  { appid: 1222680, nome: 'Need for Speed™ Heat', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing'] },

  // --- Nioh ---
  { appid: 485510, nome: 'Nioh Complete Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1150640, nome: 'Nioh 2 – The Complete Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },

  // --- One Piece ---
  { appid: 1089090, nome: 'ONE PIECE ODYSSEY', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 338530, nome: 'One Piece Pirate Warriors 3', plataformas: ['PC'], generos: ['Musou', 'Anime'], categorias: ['action'] },

  // --- Ori ---
  { appid: 1057090, nome: 'Ori and the Will of the Wisps', plataformas: ['PC'], generos: ['Metroidvania', 'Plataforma'], categorias: ['platform', 'indie'] },
  { appid: 261570, nome: 'Ori and the Blind Forest: Definitive Edition', plataformas: ['PC'], generos: ['Metroidvania', 'Plataforma'], categorias: ['platform', 'indie'] },
  { appid: 387290, nome: 'Ori and the Blind Forest', plataformas: ['PC'], generos: ['Metroidvania', 'Plataforma'], categorias: ['platform', 'indie'] },

  // --- Outlast ---
  { appid: 1809700, nome: 'The Outlast Trials', plataformas: ['PC', 'PS'], generos: ['Horror', 'Cooperativo'], categorias: ['action', 'indie'] },
  { appid: 238320, nome: 'Outlast', plataformas: ['PC', 'PS'], generos: ['Horror Psicológico'], categorias: ['indie', 'adventure'] },
  { appid: 290930, nome: 'Outlast: Whistleblower DLC', plataformas: ['PC', 'PS'], generos: ['Horror Psicológico'], categorias: ['indie', 'adventure'] },
  { appid: 414700, nome: 'Outlast 2', plataformas: ['PC', 'PS'], generos: ['Horror Psicológico'], categorias: ['indie', 'adventure'] },

  // --- Overcooked ---
  { appid: 1680880, nome: 'Overcooked! All You Can Eat', plataformas: ['PC', 'PS'], generos: ['Party Game', 'Cozinha'], categorias: ['casual', 'family'] },
  { appid: 440310, nome: 'Overcooked! 2', plataformas: ['PC', 'PS'], generos: ['Party Game', 'Cozinha'], categorias: ['casual', 'family'] },

  // --- PAYDAY ---
  { appid: 730, nome: 'PAYDAY 2', plataformas: ['PC'], generos: ['FPS', 'Tático'], categorias: ['shooter', 'action'] },
  { appid: 1272080, nome: 'PAYDAY 3', plataformas: ['PC', 'PS'], generos: ['FPS', 'Tático'], categorias: ['shooter', 'action'] },

  // --- Persona ---
  { appid: 2161700, nome: 'Persona 3 Reload', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 1687950, nome: 'Persona 5 Royal', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },

  // --- Planet / Parques ---
  { appid: 648350, nome: 'Jurassic World Evolution', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Gerenciamento'], categorias: ['simulation', 'strategy'] },
  { appid: 493340, nome: 'Planet Coaster', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Gerenciamento'], categorias: ['simulation'] },
  { appid: 703080, nome: 'Planet Zoo', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Gerenciamento'], categorias: ['simulation'] },
  { appid: 1244460, nome: 'Jurassic World Evolution 2', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Gerenciamento'], categorias: ['simulation', 'strategy'] },
  { appid: 1287840, nome: 'Planet Coaster 2', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Gerenciamento'], categorias: ['simulation'] },

  // --- Portal ---
  { appid: 400, nome: 'Portal', plataformas: ['PC'], generos: ['Puzzle', 'Primeira Pessoa'], categorias: ['adventure'] },
  { appid: 620, nome: 'Portal 2', plataformas: ['PC'], generos: ['Puzzle', 'Cooperação'], categorias: ['adventure'] },

  // --- Remnant ---
  { appid: 617290, nome: 'Remnant: From the Ashes', plataformas: ['PC', 'PS'], generos: ['Ação', 'Souls-like'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1153200, nome: 'Dissection / Remnant II', plataformas: ['PC', 'PS'], generos: ['Ação', 'Souls-like'], categorias: ['action', 'role-playing-rpg'] },

  // --- Resident Evil ---
  { appid: 1196590, nome: 'Resident Evil Village', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'FPS'], categorias: ['action', 'shooter'] },
  { appid: 883710, nome: 'Resident Evil 2 (Remake)', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Ação'], categorias: ['action', 'adventure'] },
  { appid: 2050650, nome: 'Resident Evil 4 (Remake)', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Ação'], categorias: ['action', 'adventure'] },

  // --- Risen / Gothic ---
  { appid: 40300, nome: 'Risen', plataformas: ['PC'], generos: ['RPG'], categorias: ['role-playing-rpg'] },
  { appid: 39540, nome: 'Gothic II: Gold Edition', plataformas: ['PC'], generos: ['RPG'], categorias: ['role-playing-rpg'] },
  { appid: 57700, nome: 'Risen 2: Dark Waters', plataformas: ['PC'], generos: ['RPG'], categorias: ['role-playing-rpg'] },
  { appid: 249230, nome: 'Risen 3 - Titan Lords', plataformas: ['PC'], generos: ['RPG'], categorias: ['role-playing-rpg'] },
  { appid: 39500, nome: 'Gothic 3', plataformas: ['PC'], generos: ['RPG'], categorias: ['role-playing-rpg'] },

  // --- Slime Rancher ---
  { appid: 433340, nome: 'Slime Rancher', plataformas: ['PC', 'PS'], generos: ['Exploração', 'Casual'], categorias: ['casual', 'indie'] },
  { appid: 1162520, nome: 'Slime Rancher 2', plataformas: ['PC', 'PS'], generos: ['Exploração', 'Casual'], categorias: ['casual', 'indie'] },

  // --- Sniper ---
  { appid: 63710, nome: 'Sniper Elite V2 Remastered', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Stealth'], categorias: ['shooter', 'action'] },
  { appid: 1025000, nome: 'Sniper Ghost Warrior Contracts', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Stealth'], categorias: ['shooter', 'action'] },
  { appid: 973580, nome: 'Sniper Ghost Warrior Contracts 2', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Stealth'], categorias: ['shooter', 'action'] },
  { appid: 238090, nome: 'Sniper Elite 3', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Stealth'], categorias: ['shooter', 'action'] },
  { appid: 368070, nome: 'Sniper Ghost Warrior 3', plataformas: ['PC'], generos: ['Tiro', 'Stealth'], categorias: ['shooter', 'action'] },
  { appid: 312660, nome: 'Sniper Elite 4', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Stealth'], categorias: ['shooter', 'action'] },
  { appid: 1029690, nome: 'Sniper Elite 5', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Stealth'], categorias: ['shooter', 'action'] },

  // --- Sonic ---
  { appid: 1373930, nome: 'Sonic Frontiers', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Ação'], categorias: ['platform', 'action'] },
  { appid: 1843780, nome: 'Sonic X Shadow Generations', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Ação'], categorias: ['platform', 'action'] },

  // --- South Park ---
  { appid: 213670, nome: 'South Park™: The Stick of Truth™', plataformas: ['PC', 'PS'], generos: ['RPG', 'Comédia'], categorias: ['role-playing-rpg'] },
  { appid: 488790, nome: 'South Park™: The Fractured But Whole™', plataformas: ['PC', 'PS'], generos: ['RPG', 'Comédia'], categorias: ['role-playing-rpg'] },

  // --- Spider-Man ---
  { appid: 1817070, nome: 'Marvel\'s Spider-Man Remastered', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1817190, nome: 'Marvel\'s Spider-Man: Miles Morales', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },

  // --- Star Wars ---
  { appid: 1172380, nome: 'Star Wars Jedi: Fallen Order™', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1774580, nome: 'STAR WARS Jedi: Survivor™', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 32470, nome: 'STAR WARS™ Empire at War - Gold Pack', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },
  { appid: 1237930, nome: 'STAR WARS™ Battlefront™', plataformas: ['PC', 'PS'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 1188700, nome: 'STAR WARS™: Squadrons', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Espacial'], categorias: ['simulation', 'action'] },
  { appid: 6060, nome: 'STAR WARS™ Battlefront II (Classic, 2005)', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 1237940, nome: 'STAR WARS™ Battlefront™ II', plataformas: ['PC', 'PS'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },

  // --- Street Fighter / Tekken ---
  { appid: 310950, nome: 'Street Fighter V', plataformas: ['PC', 'PS'], generos: ['Luta'], categorias: ['action'] },
  { appid: 1364780, nome: 'Street Fighter™ 6', plataformas: ['PC', 'PS'], generos: ['Luta'], categorias: ['action'] },
  { appid: 389730, nome: 'TEKKEN 7 - Ultimate Edition', plataformas: ['PC', 'PS'], generos: ['Luta'], categorias: ['action'] },
  { appid: 1778820, nome: 'TEKKEN 8', plataformas: ['PC', 'PS'], generos: ['Luta'], categorias: ['action'] },

  // --- Subnautica ---
  { appid: 264710, nome: 'Subnautica', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Aventura'], categorias: ['adventure', 'indie'] },
  { appid: 848450, nome: 'Subnautica: Below Zero', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Aventura'], categorias: ['adventure', 'indie'] },

  // --- The Evil Within ---
  { appid: 298050, nome: 'The Evil Within', plataformas: ['PC', 'PS'], generos: ['Survival Horror'], categorias: ['action', 'adventure'] },
  { appid: 601430, nome: 'The Evil Within 2', plataformas: ['PC', 'PS'], generos: ['Survival Horror'], categorias: ['action', 'adventure'] },

  // --- The Last of Us ---
  { appid: 1888930, nome: 'The Last of Us Part I', plataformas: ['PC', 'PS'], generos: ['Ação', 'Sobrevivência'], categorias: ['action', 'adventure'], estoque: false },
  { appid: 2531310, nome: 'The Last of Us Part II Remastered', plataformas: ['PC', 'PS'], generos: ['Ação', 'Sobrevivência'], categorias: ['action', 'adventure'] },

  // --- The Legend of Heroes ---
  { appid: 251150, nome: 'The Legend of Heroes: Trails in the Sky', plataformas: ['PC'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 337980, nome: 'The Legend of Heroes: Trails in the Sky SC', plataformas: ['PC'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 436670, nome: 'The Legend of Heroes: Trails in the Sky the 3rd', plataformas: ['PC'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 538680, nome: 'The Legend of Heroes: Trails of Cold Steel', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 1668540, nome: 'The Legend of Heroes: Trails into Reverie', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 1811950, nome: 'The Legend of Heroes: Trails through Daybreak', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 748490, nome: 'The Legend of Heroes: Trails of Cold Steel II', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 991270, nome: 'The Legend of Heroes: Trails of Cold Steel III', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },
  { appid: 1198090, nome: 'The Legend of Heroes: Trails of Cold Steel IV', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg'] },

  // --- The Talos Principle ---
  { appid: 257510, nome: 'The Talos Principle', plataformas: ['PC', 'PS'], generos: ['Puzzle', 'Primeira Pessoa'], categorias: ['indie', 'adventure'] },
  { appid: 1920960, nome: 'The Talos Principle 2', plataformas: ['PC', 'PS'], generos: ['Puzzle', 'Primeira Pessoa'], categorias: ['indie', 'adventure'] },

  // --- The Witcher ---
  { appid: 20920, nome: 'The Witcher: Enhanced Edition Director\'s Cut', plataformas: ['PC'], generos: ['RPG'], categorias: ['role-playing-rpg'] },
  { appid: 292030, nome: 'The Witcher 3: Wild Hunt', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 378640, nome: 'The Witcher 3: Wild Hunt - Blood and Wine', plataformas: ['PC', 'PS'], generos: ['RPG'], categorias: ['role-playing-rpg'] },

  // --- Tom Clancy's ---
  { appid: 359550, nome: 'Tom Clancy\'s Rainbow Six® Siege (Edição Paga)', plataformas: ['PC', 'PS'], generos: ['FPS', 'Tático'], categorias: ['shooter', 'action'] },
  { appid: 460930, nome: 'Tom Clancy\'s Ghost Recon® Wildlands', plataformas: ['PC', 'PS'], generos: ['Tiro', 'Mundo Aberto'], categorias: ['shooter', 'action'] },

  // --- Tomb Raider ---
  { appid: 247060, nome: 'Tomb Raider', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 391220, nome: 'Rise of the Tomb Raider', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 750920, nome: 'Shadow of the Tomb Raider Definitive Edition', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },

  // --- Total War ---
  { appid: 364360, nome: 'Total War: WARHAMMER', plataformas: ['PC'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 4700, nome: 'Medieval II: Total War™ Definitive Edition', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },
  { appid: 4770, nome: 'Rome: Total War™ - Alexander', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },
  { appid: 594570, nome: 'Total War: WARHAMMER II', plataformas: ['PC'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 214950, nome: 'Total War: SHOGUN 2', plataformas: ['PC'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 1142710, nome: 'Total War: WARHAMMER III', plataformas: ['PC'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },

  // --- Truck / Mud ---
  { appid: 270880, nome: 'American Truck Simulator', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 1465360, nome: 'SnowRunner', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Condução'], categorias: ['simulation'] },
  { appid: 675010, nome: 'MudRunner', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Condução'], categorias: ['simulation'] },
  { appid: 227300, nome: 'Euro Truck Simulator 2', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },

  // --- Warhammer ---
  { appid: 552500, nome: 'Warhammer: Vermintide 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Cooperativo'], categorias: ['action'] },
  { appid: 2183900, nome: 'Warhammer 40,000: Space Marine 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Tiro'], categorias: ['action', 'shooter'] },
  { appid: 1361210, nome: 'Warhammer 40,000: Darktide', plataformas: ['PC', 'PS'], generos: ['FPS', 'Cooperativo'], categorias: ['shooter', 'action'] },
  { appid: 228300, nome: 'Warhammer 40,000: Dawn of War II', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },
  { appid: 4570, nome: 'Warhammer 40,000: Dawn of War - GOTY Edition', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },
  { appid: 285190, nome: 'Warhammer 40,000: Dawn of War III', plataformas: ['PC'], generos: ['Estratégia', 'RTS'], categorias: ['strategy'] },
  { appid: 550900, nome: 'Warhammer 40,000: Inquisitor - Martyr', plataformas: ['PC', 'PS'], generos: ['RPG', 'Action RPG'], categorias: ['role-playing-rpg', 'action'] },

  // --- Wolfenstein ---
  { appid: 206420, nome: 'Wolfenstein: The New Order', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },
  { appid: 254700, nome: 'Wolfenstein: The Old Blood', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },
  { appid: 612880, nome: 'Wolfenstein II: The New Colossus', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },

  // --- Yakuza / Like a Dragon ---
  { appid: 2988580, nome: 'Yakuza 0 Director\'s Cut', plataformas: ['PC'], generos: ['Ação', 'Luta'], categorias: ['action', 'adventure'] },
  { appid: 1235140, nome: 'Yakuza: Like a Dragon', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 2072450, nome: 'Like a Dragon: Infinite Wealth', plataformas: ['PC', 'PS'], generos: ['RPG', 'Turnos'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1805480, nome: 'Like a Dragon: Ishin!', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1283970, nome: 'Yakuza Kiwami', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 927380, nome: 'Yakuza Kiwami 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1088710, nome: 'Yakuza 3 Remastered', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1088720, nome: 'Yakuza 4 Remastered', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1088730, nome: 'Yakuza 5 Remastered', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1388590, nome: 'Yakuza 6: The Song of Life', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },

  // ================= JOGOS ÚNICOS =================
  { appid: 251570, nome: '7 Days to Die', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'FPS'], categorias: ['indie', 'action'] },
  { appid: 427410, nome: 'Abiotic Factor', plataformas: ['PC'], generos: ['Sobrevivência', 'Sci-Fi'], categorias: ['indie', 'adventure'] },
  { appid: 219890, nome: 'Antichamber', plataformas: ['PC'], generos: ['Puzzle', 'Primeira Pessoa'], categorias: ['indie', 'adventure'] },
  { appid: 752590, nome: 'A Plague Tale: Innocence', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Mistério'], categorias: ['adventure'] },
  { appid: 1230530, nome: 'Atlas Fallen: Reign Of Sand', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1222700, nome: 'A Way Out', plataformas: ['PC', 'PS'], generos: ['Cooperação', 'Aventura'], categorias: ['adventure', 'action'] },
  { appid: 924970, nome: 'Back 4 Blood', plataformas: ['PC', 'PS'], generos: ['FPS', 'Cooperativo'], categorias: ['shooter', 'action'] },
  { appid: 2379780, nome: 'Balatro', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Cartas'], categorias: ['indie', 'casual'] },
  { appid: 1086940, nome: 'Baldur\'s Gate 3', plataformas: ['PC', 'PS'], generos: ['RPG', 'Estratégia'], categorias: ['role-playing-rpg', 'strategy'] },
  { appid: 2358720, nome: 'Black Myth: Wukong', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1013140, nome: 'Bloodstained: Ritual of the Night', plataformas: ['PC', 'PS'], generos: ['Metroidvania', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 26800, nome: 'Braid', plataformas: ['PC'], generos: ['Puzzle', 'Plataforma'], categorias: ['indie', 'platform'] },
  { appid: 1971800, nome: 'Braid Anniversary Edition', plataformas: ['PC', 'PS'], generos: ['Puzzle', 'Plataforma'], categorias: ['indie', 'platform'] },
  { appid: 1324350, nome: 'Bramble: The Mountain King', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Horror'], categorias: ['adventure', 'indie'] },
  { appid: 225600, nome: 'Broforce', plataformas: ['PC', 'PS'], generos: ['Ação', 'Plataforma'], categorias: ['action', 'indie'] },
  { appid: 1942280, nome: 'Brotato', plataformas: ['PC'], generos: ['Roguelike', 'Casual'], categorias: ['indie', 'action'] },
  { appid: 42700, nome: 'Call of Juarez: Gunslinger', plataformas: ['PC'], generos: ['FPS', 'Faroeste'], categorias: ['shooter', 'action'] },
  { appid: 204360, nome: 'Castle Crashers®', plataformas: ['PC', 'PS'], generos: ['Beat em up', 'Cooperação'], categorias: ['action', 'indie'] },
  { appid: 1466860, nome: 'Castlevania Dominus Collection', plataformas: ['PC', 'PS'], generos: ['Metroidvania', 'Ação'], categorias: ['action', 'adventure'] },
  { appid: 504230, nome: 'Celeste', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Indie'], categorias: ['platform', 'indie'] },
  { appid: 256290, nome: 'Child of Light', plataformas: ['PC', 'PS'], generos: ['RPG', 'Plataforma'], categorias: ['role-playing-rpg', 'indie'] },
  { appid: 870780, nome: 'Control Ultimate Edition', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 1307550, nome: 'Craftopia', plataformas: ['PC'], generos: ['Sobrevivência', 'Crafting'], categorias: ['indie', 'adventure'] },
  { appid: 247080, nome: 'Crypt of the NecroDancer', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Ritmo'], categorias: ['indie', 'action'] },
  { appid: 1313140, nome: 'Cult of the Lamb', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Gerenciamento'], categorias: ['action', 'indie'] },
  { appid: 268910, nome: 'Cuphead', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 1091500, nome: 'Cyberpunk 2077', plataformas: ['PC'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 262060, nome: 'Darkest Dungeon®', plataformas: ['PC', 'PS'], generos: ['Turnos', 'Roguelike'], categorias: ['indie', 'strategy'] },
  { appid: 1868140, nome: 'Dave the Diver', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Gerenciamento'], categorias: ['indie', 'casual'] },
  { appid: 30, nome: 'Day of Defeat', plataformas: ['PC'], generos: ['FPS', 'Guerra'], categorias: ['shooter', 'action'] },
  { appid: 300, nome: 'Day of Defeat: Source', plataformas: ['PC'], generos: ['FPS', 'Guerra'], categorias: ['shooter', 'action'] },
  { appid: 1259420, nome: 'Days Gone', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 221100, nome: 'DayZ', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'FPS'], categorias: ['action', 'shooter'] },
  { appid: 381210, nome: 'Dead by Daylight', plataformas: ['PC', 'PS'], generos: ['Horror', 'Multiplayer'], categorias: ['action', 'indie'] },
  { appid: 588650, nome: 'Dead Cells: Return to Castlevania', plataformas: ['PC', 'PS'], generos: ['Metroidvania', 'Roguelike'], categorias: ['action', 'indie'] },
  { appid: 1252330, nome: 'DEATHLOOP', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },
  { appid: 1222140, nome: 'Detroit: Become Human', plataformas: ['PC', 'PS'], generos: ['História Interativa', 'Sci-Fi'], categorias: ['adventure'] },
  { appid: 601150, nome: 'Devil May Cry 5', plataformas: ['PC', 'PS'], generos: ['Hack and Slash', 'Ação'], categorias: ['action'] },
  { appid: 322330, nome: 'Don\'t Starve Together', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Indie'], categorias: ['indie', 'adventure'] },
  { appid: 2054970, nome: 'Dragon\'s Dogma 2', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1569040, nome: 'DREDGE', plataformas: ['PC', 'PS'], generos: ['Pesca', 'Horror'], categorias: ['indie', 'adventure'] },
  { appid: 236090, nome: 'Dust: An Elysian Tail', plataformas: ['PC', 'PS'], generos: ['Metroidvania', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 1245620, nome: 'Elden Ring', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 383120, nome: 'Empyrion - Galactic Survival', plataformas: ['PC'], generos: ['Sobrevivência', 'Sci-Fi'], categorias: ['indie', 'simulation'] },
  { appid: 311690, nome: 'Enter the Gungeon: Collector\'s Edition', plataformas: ['PC'], generos: ['Roguelike', 'Bullet Hell'], categorias: ['action', 'indie'] },
  { appid: 8500, nome: 'EVE Online (Edição Premium)', plataformas: ['PC'], generos: ['MMO', 'Sci-Fi'], categorias: ['role-playing-rpg', 'strategy'] },
  { appid: 3059520, nome: 'F1® 25', plataformas: ['PC', 'PS'], generos: ['Corrida'], categorias: ['racing', 'sport'] },
  { appid: 224760, nome: 'FEZ', plataformas: ['PC', 'PS'], generos: ['Puzzle', 'Plataforma'], categorias: ['platform', 'indie'] },
  { appid: 327310, nome: 'Finding Paradise', plataformas: ['PC'], generos: ['História Interativa', 'Indie'], categorias: ['adventure', 'indie'] },
  { appid: 1190000, nome: 'Gas Station Simulator', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Gerenciamento'], categorias: ['simulation', 'indie'] },
  { appid: 1361510, nome: 'Ghost of Tsushima DIRECTOR\'S CUT', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 265930, nome: 'Goat Simulator', plataformas: ['PC', 'PS'], generos: ['Casual', 'Comédia'], categorias: ['casual', 'action'] },
  { appid: 1785650, nome: 'Granblue Fantasy: Relink', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 3240220, nome: 'Grand Theft Auto V', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 815370, nome: 'Green Hell', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Simulação'], categorias: ['adventure', 'indie'] },
  { appid: 252150, nome: 'Grim Dawn', plataformas: ['PC'], generos: ['RPG', 'Action RPG'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 962130, nome: 'Grounded', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Aventura'], categorias: ['adventure', 'action'] },
  { appid: 1240440, nome: 'Halo Infinite (Campanha)', plataformas: ['PC'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 960990, nome: 'Heavy Rain', plataformas: ['PC', 'PS'], generos: ['História Interativa', 'Mistério'], categorias: ['adventure'] },
  { appid: 1817230, nome: 'Hi-Fi RUSH', plataformas: ['PC', 'PS'], generos: ['Ação', 'Ritmo'], categorias: ['action'] },
  { appid: 990080, nome: 'Hogwarts Legacy', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 367520, nome: 'Hollow Knight', plataformas: ['PC'], generos: ['Metroidvania'], categorias: ['platform', 'indie'] },
  { appid: 2420110, nome: 'Horizon Forbidden West™ Complete Edition', plataformas: ['PC', 'PS'], generos: ['Ação', 'RPG'], categorias: ['action', 'role-playing-rpg'] },
  { appid: 1182680, nome: 'Impostor Factory', plataformas: ['PC'], generos: ['História Interativa', 'Indie'], categorias: ['adventure', 'indie'] },
  { appid: 270150, nome: 'INSIDE', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Puzzle'], categorias: ['indie', 'platform'] },
  { appid: 1426210, nome: 'It Takes Two', plataformas: ['PC', 'PS'], generos: ['Cooperação', 'Plataforma'], categorias: ['adventure', 'platform'] },
  { appid: 460920, nome: 'Katana ZERO', plataformas: ['PC', 'PS'], generos: ['Ação', 'Plataforma'], categorias: ['action', 'indie'] },
  { appid: 1520370, nome: 'Lawn Mowing Simulator', plataformas: ['PC', 'PS'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 1966720, nome: 'Lethal Company', plataformas: ['PC'], generos: ['Horror', 'Cooperativo'], categorias: ['indie', 'action'] },
  { appid: 1740720, nome: 'Lies of P', plataformas: ['PC', 'PS'], generos: ['RPG', 'Souls-like'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 1627720, nome: 'Lies of P: Overture', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 48000, nome: 'LIMBO', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Puzzle'], categorias: ['indie', 'platform'] },
  { appid: 209830, nome: 'Lone Survivor: The Director\'s Cut', plataformas: ['PC'], generos: ['Horror', 'Indie'], categorias: ['indie', 'adventure'] },
  { appid: 1686770, nome: 'Manor Lords', plataformas: ['PC'], generos: ['Estratégia', 'Construção'], categorias: ['strategy', 'simulation'] },
  { appid: 1129580, nome: 'Medieval Dynasty', plataformas: ['PC', 'PS'], generos: ['Simulação', 'RPG'], categorias: ['simulation', 'role-playing-rpg'] },
  { appid: 1250410, nome: 'Microsoft Flight Simulator', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 2537590, nome: 'Microsoft Flight Simulator 2024', plataformas: ['PC'], generos: ['Simulação'], categorias: ['simulation'] },
  { appid: 241930, nome: 'Middle-earth™: Shadow of Mordor™', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 593110, nome: 'Middle-earth™: Shadow of War™', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 524220, nome: 'NieR:Automata™', plataformas: ['PC', 'PS'], generos: ['RPG', 'Ação'], categorias: ['role-playing-rpg', 'action'] },
  { appid: 275850, nome: 'No Man\'s Sky', plataformas: ['PC', 'PS'], generos: ['Mundo Aberto', 'Sci-Fi'], categorias: ['adventure', 'action'] },
  { appid: 1150690, nome: 'OMORI', plataformas: ['PC', 'PS'], generos: ['RPG', 'Horror Psicológico'], categorias: ['role-playing-rpg', 'indie'] },
  { appid: 264200, nome: 'OneShot', plataformas: ['PC'], generos: ['Puzzle', 'Aventura'], categorias: ['indie', 'adventure'] },
  { appid: 1070560, nome: 'Outer Wilds', plataformas: ['PC', 'PS'], generos: ['Exploração', 'Mistério'], categorias: ['adventure', 'indie'] },
  { appid: 794260, nome: 'Outward Definitive Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Sobrevivência'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 1547000, nome: 'Pacific Drive', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Condução'], categorias: ['indie', 'adventure'] },
  { appid: 1458140, nome: 'Pacific Drive: Deluxe Edition', plataformas: ['PC', 'PS'], generos: ['Sobrevivência'], categorias: ['adventure', 'indie'] },
  { appid: 1623730, nome: 'Palworld', plataformas: ['PC'], generos: ['Sobrevivência', 'Mundo Aberto'], categorias: ['adventure', 'indie'] },
  { appid: 739630, nome: 'Phasmophobia', plataformas: ['PC', 'PS'], generos: ['Horror', 'Cooperativo'], categorias: ['indie', 'action'] },
  { appid: 1488200, nome: 'PowerWash Simulator', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Casual'], categorias: ['simulation', 'casual'] },
  { appid: 480490, nome: 'Prey (2017)', plataformas: ['PC', 'PS'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 108600, nome: 'Project Zomboid', plataformas: ['PC'], generos: ['Sobrevivência', 'Zumbis'], categorias: ['indie', 'simulation'] },
  { appid: 578080, nome: 'PUBG: BATTLEGROUNDS (Premium/Legacy)', plataformas: ['PC', 'PS'], generos: ['Battle Royale', 'FPS'], categorias: ['shooter', 'action'] },
  { appid: 648800, nome: 'Raft', plataformas: ['PC'], generos: ['Sobrevivência', 'Construção'], categorias: ['adventure', 'indie'] },
  { appid: 92100, nome: 'RAGE', plataformas: ['PC'], generos: ['FPS', 'Pós-Apocalíptico'], categorias: ['shooter', 'action'] },
  { appid: 1086000, nome: 'RAGE 2', plataformas: ['PC', 'PS'], generos: ['FPS', 'Mundo Aberto'], categorias: ['shooter', 'action'] },
  { appid: 1049590, nome: 'Ratchet & Clank: Rift Apart', plataformas: ['PC', 'PS'], generos: ['Ação', 'Plataforma'], categorias: ['action', 'platform'] },
  { appid: 247230, nome: 'Rayman Legends', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Ação'], categorias: ['platform', 'family'] },
  { appid: 1174180, nome: 'Red Dead Redemption 2', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 1649240, nome: 'Returnal', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'FPS'], categorias: ['action', 'shooter'] },
  { appid: 294100, nome: 'RimWorld', plataformas: ['PC'], generos: ['Simulação', 'Estratégia'], categorias: ['simulation', 'strategy'] },
  { appid: 1677740, nome: 'Rise of the Ronin', plataformas: ['PC', 'PS'], generos: ['Ação', 'Mundo Aberto'], categorias: ['action', 'adventure'] },
  { appid: 252490, nome: 'Rust', plataformas: ['PC'], generos: ['Sobrevivência', 'Multiplayer'], categorias: ['action', 'indie'] },
  { appid: 1056960, nome: 'Sackboy: A Big Adventure', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Aventura'], categorias: ['platform', 'family'] },
  { appid: 698670, nome: 'Scorn', plataformas: ['PC'], generos: ['Survival Horror', 'Puzzle'], categorias: ['adventure', 'indie'] },
  { appid: 513710, nome: 'SCUM', plataformas: ['PC'], generos: ['Sobrevivência', 'Multiplayer'], categorias: ['action', 'indie'] },
  { appid: 1172620, nome: 'Sea of Thieves', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Mundo Aberto'], categorias: ['adventure', 'action'] },
  { appid: 814380, nome: 'Sekiro™: Shadows Die Twice', plataformas: ['PC', 'PS'], generos: ['Ação', 'Souls-like'], categorias: ['action', 'adventure'] },
  { appid: 986130, nome: 'Shadows of Doubt', plataformas: ['PC', 'PS'], generos: ['Investigação', 'Procedural'], categorias: ['indie', 'adventure'] },
  { appid: 250760, nome: 'Shovel Knight: Treasure Trove', plataformas: ['PC', 'PS'], generos: ['Plataforma', 'Retro'], categorias: ['platform', 'indie'] },
  { appid: 289070, nome: 'Sid Meier\'s Civilization® VI', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 1366540, nome: 'Sid Meier\'s Civilization® VII', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 1326470, nome: 'Sifu', plataformas: ['PC', 'PS'], generos: ['Ação', 'Luta'], categorias: ['action', 'indie'] },
  { appid: 2124490, nome: 'SILENT HILL 2', plataformas: ['PC', 'PS'], generos: ['Survival Horror', 'Mistério'], categorias: ['adventure', 'action'] },
  { appid: 646570, nome: 'Slay the Spire', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Cartas'], categorias: ['indie', 'strategy'] },
  { appid: 1325200, nome: 'Solar Ash', plataformas: ['PC', 'PS'], generos: ['Ação', 'Plataforma'], categorias: ['action', 'indie'] },
  { appid: 282140, nome: 'SOMA', plataformas: ['PC', 'PS'], generos: ['Horror', 'Sci-Fi'], categorias: ['indie', 'adventure'] },
  { appid: 1326410, nome: 'Sons Of The Forest', plataformas: ['PC'], generos: ['Sobrevivência', 'Horror'], categorias: ['adventure', 'indie'] },
  { appid: 244850, nome: 'Space Engineers', plataformas: ['PC', 'PS'], generos: ['Simulação', 'Sandbox'], categorias: ['simulation', 'indie'] },
  { appid: 107200, nome: 'Space Pirates and Zombies', plataformas: ['PC'], generos: ['Estratégia', 'Espacial'], categorias: ['strategy', 'indie'] },
  { appid: 413150, nome: 'Stardew Valley', plataformas: ['PC', 'PS'], generos: ['Simulação', 'RPG'], categorias: ['simulation', 'indie'] },
  { appid: 1716740, nome: 'STARFIELD', plataformas: ['PC'], generos: ['RPG', 'Sci-Fi'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 1332010, nome: 'Stray', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Indie'], categorias: ['adventure', 'indie'] },
  { appid: 512900, nome: 'Streets of Rogue', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 48240, nome: 'System Shock 2', plataformas: ['PC'], generos: ['FPS', 'RPG'], categorias: ['shooter', 'role-playing-rpg'] },
  { appid: 2659300, nome: 'TCG Card Shop Simulator', plataformas: ['PC'], generos: ['Simulação', 'Gerenciamento'], categorias: ['simulation', 'indie'] },
  { appid: 105600, nome: 'Terraria', plataformas: ['PC'], generos: ['Sandbox', 'Sobrevivência'], categorias: ['indie', 'adventure'] },
  { appid: 250900, nome: 'The Binding of Isaac: Rebirth', plataformas: ['PC', 'PS'], generos: ['Roguelike', 'Indie'], categorias: ['action', 'indie'] },
  { appid: 489830, nome: 'The Elder Scrolls V: Skyrim Special Edition', plataformas: ['PC', 'PS'], generos: ['RPG', 'Mundo Aberto'], categorias: ['role-playing-rpg', 'adventure'] },
  { appid: 242760, nome: 'The Forest', plataformas: ['PC'], generos: ['Sobrevivência', 'Horror'], categorias: ['adventure', 'indie'] },
  { appid: 1659770, nome: 'The Quarry', plataformas: ['PC', 'PS'], generos: ['Horror', 'História Interativa'], categorias: ['adventure'] },
  { appid: 1237970, nome: 'Titanfall® 2', plataformas: ['PC', 'PS'], generos: ['FPS', 'Sci-Fi'], categorias: ['shooter', 'action'] },
  { appid: 206440, nome: 'To the Moon', plataformas: ['PC'], generos: ['História Interativa', 'Indie'], categorias: ['adventure', 'indie'] },
  { appid: 1164940, nome: 'Trepang2', plataformas: ['PC', 'PS'], generos: ['FPS', 'Ação'], categorias: ['shooter', 'action'] },
  { appid: 553420, nome: 'TUNIC', plataformas: ['PC', 'PS'], generos: ['Aventura', 'Isométrico'], categorias: ['adventure', 'indie'] },
  { appid: 1659420, nome: 'UNCHARTED™: Legacy of Thieves Collection', plataformas: ['PC', 'PS'], generos: ['Ação', 'Aventura'], categorias: ['action', 'adventure'] },
  { appid: 391540, nome: 'Undertale', plataformas: ['PC', 'PS'], generos: ['RPG', 'Indie'], categorias: ['role-playing-rpg', 'indie'] },
  { appid: 1281590, nome: 'Until Dawn (Remake)', plataformas: ['PC', 'PS'], generos: ['Horror', 'História Interativa'], categorias: ['adventure'] },
  { appid: 674940, nome: 'Untitled Goose Game', plataformas: ['PC', 'PS'], generos: ['Casual', 'Indie'], categorias: ['casual', 'indie'] },
  { appid: 892970, nome: 'Valheim', plataformas: ['PC'], generos: ['Sobrevivência', 'Mundo Aberto'], categorias: ['indie', 'action'] },
  { appid: 1794680, nome: 'Vampire Survivors', plataformas: ['PC'], generos: ['Roguelike', 'Casual'], categorias: ['indie', 'action'] },
  { appid: 431960, nome: 'Wallpaper Engine', plataformas: ['PC'], generos: ['Utilitário'], categorias: ['utility', 'casual'] },
  { appid: 501300, nome: 'What Remains of Edith Finch', plataformas: ['PC', 'PS'], generos: ['História Interativa'], categorias: ['adventure', 'indie'] },
  { appid: 1229240, nome: 'Wildmender', plataformas: ['PC', 'PS'], generos: ['Sobrevivência', 'Aventura'], categorias: ['adventure', 'indie'] },
  { appid: 2125510, nome: 'Wizard of Legend 2', plataformas: ['PC'], generos: ['Roguelike', 'Ação'], categorias: ['action', 'indie'] },
  { appid: 268500, nome: 'XCOM® 2', plataformas: ['PC', 'PS'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
  { appid: 200510, nome: 'XCOM: Enemy Unknown', plataformas: ['PC'], generos: ['Estratégia', 'Turnos'], categorias: ['strategy'] },
];