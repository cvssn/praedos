export type Platform = 'pc' | 'ps4' | 'xb1' | 'swi';

export interface CycleState {
  id: string;
  expiry: string;
  activation: string;
  isDay?: boolean;
  state: string;
  timeLeft: string;
  shortString?: string;
}

export interface Fissure {
  id: string;
  node: string;
  missionType: string;
  enemy: string;
  tier: string;
  tierNum: number;
  expiry: string;
  activation: string;
  isStorm: boolean;
  isHard: boolean;
  expired: boolean;
  eta: string;
}

export interface Sortie {
  id: string;
  activation: string;
  expiry: string;
  boss: string;
  faction: string;
  variants: { node: string; missionType: string; modifier: string; modifierDescription: string }[];
  eta: string;
  expired: boolean;
}

export interface ArchonHunt {
  id: string;
  activation: string;
  expiry: string;
  boss: string;
  faction: string;
  missions: { node: string; type: string }[];
  eta: string;
  expired: boolean;
}

export interface Invasion {
  id: string;
  node: string;
  desc: string;
  attacker: { faction: string; reward: { asString: string } };
  defender: { faction: string; reward: { asString: string } };
  completion: number;
  completed: boolean;
  eta: string;
}

export interface VoidTrader {
  id: string;
  activation: string;
  expiry: string;
  startString: string;
  endString: string;
  active: boolean;
  character: string;
  location: string;
  inventory: { item: string; ducats: number; credits: number }[];
}

export interface Nightwave {
  id: string;
  activation: string;
  expiry: string;
  season: number;
  tag: string;
  activeChallenges: {
    id: string;
    title: string;
    desc: string;
    reputation: number;
    isDaily: boolean;
    isElite: boolean;
    expiry: string;
  }[];
}

export interface Worldstate {
  timestamp: string;
  cetusCycle: CycleState;
  vallisCycle: CycleState;
  cambionCycle: CycleState;
  zarimanCycle: CycleState;
  earthCycle: CycleState;
  duviriCycle: CycleState;
  sortie: Sortie;
  archonHunt: ArchonHunt | null;
  fissures: Fissure[];
  invasions: Invasion[];
  voidTrader: VoidTrader;
  nightwave: Nightwave | null;
}

export interface MarketOrder {
  platinum: number;
  quantity: number;
  order_type: 'sell' | 'buy';
  platform: string;
  region: string;
  creation_date: string;
  last_update: string;
  visible: boolean;
  user: {
    ingame_name: string;
    status: 'ingame' | 'online' | 'offline';
    reputation: number;
  };
}

export interface MarketItemSummary {
  url_name: string;
  item_name: string;
  thumb: string;
}

export interface LogEvent {
  ts: number;
  category: string;
  message: string;
}

export interface AppSettings {
  platform: Platform;
  eeLogPath: string;
  refreshIntervalSec: number;
  notifyOnFissure: boolean;
  notifyOnArbitration: boolean;
  startMinimized: boolean;
  closeToTray: boolean;
}

export interface NoteItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export type BuildCategory =
  | 'warframe'
  | 'primary'
  | 'secondary'
  | 'melee'
  | 'archwing'
  | 'companion'
  | 'other';

export interface BuildItem {
  id: string;
  name: string;
  category: BuildCategory;
  loadout: string;
  mods: string;
  notes: string;
  imagePath?: string;
  createdAt: number;
  updatedAt: number;
}

export type BuildInput = Omit<BuildItem, 'id' | 'createdAt' | 'updatedAt'>;
export type BuildPatch = Partial<BuildInput>;

export interface PraedosApi {
  worldstate: {
    get(): Promise<Worldstate>;
  };
  market: {
    search(query: string): Promise<MarketItemSummary[]>;
    orders(urlName: string): Promise<MarketOrder[]>;
  };
  settings: {
    get(): Promise<AppSettings>;
    set(patch: Partial<AppSettings>): Promise<AppSettings>;
  };
  notes: {
    list(): Promise<NoteItem[]>;
    add(text: string): Promise<NoteItem[]>;
    toggle(id: string): Promise<NoteItem[]>;
    remove(id: string): Promise<NoteItem[]>;
  };
  builds: {
    list(): Promise<BuildItem[]>;
    add(input: BuildInput): Promise<BuildItem[]>;
    update(id: string, patch: BuildPatch): Promise<BuildItem[]>;
    remove(id: string): Promise<BuildItem[]>;
    pickImage(): Promise<string | null>;
    readImage(path: string): Promise<string | null>;
  };
  log: {
    onEvent(cb: (event: LogEvent) => void): () => void;
    setPath(path: string): Promise<void>;
    pickFile(): Promise<string | null>;
    recent(): Promise<LogEvent[]>;
  };
  window: {
    minimize(): void;
    maximize(): void;
    close(): void;
    isMaximized(): Promise<boolean>;
  };
  shell: {
    openExternal(url: string): Promise<void>;
  };
}

declare global {
  interface Window {
    praedos: PraedosApi;
  }
}
