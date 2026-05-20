export interface ThemeColors {
  bg: string;
  bg1: string;
  bg2: string;
  bg3: string;
  border: string;
  borderBright: string;
  fg: string;
  fgMute: string;
  fgDim: string;
  accent: string;
  accent2: string;
  warn: string;
  bad: string;
  good: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    id: 'lotus',
    name: 'Lotus',
    description: 'Default cyber-cyan (current theme)',
    colors: {
      bg: '#07070a',
      bg1: '#0c0d12',
      bg2: '#11131a',
      bg3: '#181a24',
      border: '#21242f',
      borderBright: '#2c3140',
      fg: '#e6e8ef',
      fgMute: '#9aa1b3',
      fgDim: '#5b6275',
      accent: '#00e0ff',
      accent2: '#6f5cff',
      warn: '#ffb454',
      bad: '#ff5365',
      good: '#4ade80',
    },
  },
  {
    id: 'conquera',
    name: 'Conquera',
    description: 'Vibrant magenta on royal purple',
    colors: {
      bg: '#2a103a',
      bg1: '#371547',
      bg2: '#451c5a',
      bg3: '#55236d',
      border: '#6a2f85',
      borderBright: '#8a3eab',
      fg: '#ffffff',
      fgMute: '#e3c8f0',
      fgDim: '#a888bd',
      accent: '#b463ca',
      accent2: '#ff7adf',
      warn: '#ffcf6b',
      bad: '#ff6b8b',
      good: '#9ef79f',
    },
  },
  {
    id: 'equinox',
    name: 'Equinox',
    description: 'Twilight contrast — deep indigo',
    colors: {
      bg: '#13101c',
      bg1: '#1e1928',
      bg2: '#272036',
      bg3: '#322a44',
      border: '#3c3354',
      borderBright: '#544775',
      fg: '#ffffff',
      fgMute: '#c8c2d6',
      fgDim: '#8881a0',
      accent: '#b8a8ff',
      accent2: '#ffd56b',
      warn: '#ffb454',
      bad: '#ff5365',
      good: '#7ce0a1',
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Accessibility — yellow on deep blue',
    colors: {
      bg: '#050a1a',
      bg1: '#0b1936',
      bg2: '#13234a',
      bg3: '#1c3068',
      border: '#2a4488',
      borderBright: '#3f60b3',
      fg: '#ffff00',
      fgMute: '#fff36b',
      fgDim: '#c9bf50',
      accent: '#ffff00',
      accent2: '#ffd000',
      warn: '#ffa500',
      bad: '#ff4444',
      good: '#7fff00',
    },
  },
  {
    id: 'vitruvian',
    name: 'Vitruvian',
    description: 'Hydroid-era aqua glow',
    colors: {
      bg: '#021016',
      bg1: '#062028',
      bg2: '#0a2f3c',
      bg3: '#0f4154',
      border: '#155068',
      borderBright: '#1f7191',
      fg: '#dffafe',
      fgMute: '#8dc6d3',
      fgDim: '#5a8a96',
      accent: '#46e8ff',
      accent2: '#7affc8',
      warn: '#ffd35a',
      bad: '#ff647e',
      good: '#4ade80',
    },
  },
  {
    id: 'fortuna',
    name: 'Fortuna',
    description: 'Orb Vallis amber & teal',
    colors: {
      bg: '#0e1318',
      bg1: '#171f27',
      bg2: '#202b36',
      bg3: '#2b3946',
      border: '#3a4b5d',
      borderBright: '#506782',
      fg: '#f6e5cd',
      fgMute: '#c4b69f',
      fgDim: '#7e7461',
      accent: '#ff9b3d',
      accent2: '#2ecbb5',
      warn: '#ffc15c',
      bad: '#ff5e6a',
      good: '#5be092',
    },
  },
  {
    id: 'nidus',
    name: 'Nidus',
    description: 'Infested organic crimson',
    colors: {
      bg: '#15090a',
      bg1: '#1f0e10',
      bg2: '#2a1517',
      bg3: '#391b1d',
      border: '#4d2528',
      borderBright: '#6e3439',
      fg: '#f4d8ce',
      fgMute: '#c1948c',
      fgDim: '#7d5b56',
      accent: '#e5523f',
      accent2: '#ffa86b',
      warn: '#ffb04a',
      bad: '#ff4060',
      good: '#86d97a',
    },
  },
  {
    id: 'stalker',
    name: 'Stalker',
    description: 'Shadow Tenno blood-red',
    colors: {
      bg: '#08080a',
      bg1: '#11090b',
      bg2: '#180c0e',
      bg3: '#231114',
      border: '#3a1a1f',
      borderBright: '#5a262d',
      fg: '#f0e0e3',
      fgMute: '#b89aa0',
      fgDim: '#735c61',
      accent: '#ff3a48',
      accent2: '#ff8484',
      warn: '#ff9c3f',
      bad: '#ff5050',
      good: '#7fdf80',
    },
  },
  {
    id: 'daybreak',
    name: 'Daybreak',
    description: 'Plains of Eidolon warm dawn',
    colors: {
      bg: '#1b150e',
      bg1: '#241c12',
      bg2: '#2e2417',
      bg3: '#3a2e1e',
      border: '#4e3e28',
      borderBright: '#6f5938',
      fg: '#fbeed3',
      fgMute: '#cfbb95',
      fgDim: '#8d7a55',
      accent: '#ffc25c',
      accent2: '#ff8a3d',
      warn: '#ffd56b',
      bad: '#ff5b5b',
      good: '#86d96a',
    },
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    description: 'Tenno sky — light wind blue',
    colors: {
      bg: '#0b1018',
      bg1: '#121a26',
      bg2: '#1a2535',
      bg3: '#243348',
      border: '#324361',
      borderBright: '#475d85',
      fg: '#e7f0ff',
      fgMute: '#a5b7d0',
      fgDim: '#647a98',
      accent: '#7cb6ff',
      accent2: '#aac8ff',
      warn: '#ffc46b',
      bad: '#ff6b80',
      good: '#7fd9a3',
    },
  },
];

export const DEFAULT_THEME_ID = 'lotus';

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
