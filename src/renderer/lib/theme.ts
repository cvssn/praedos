import { getTheme, type Theme } from '@shared/themes';

const VAR_MAP: Record<keyof Theme['colors'], string> = {
  bg: '--color-bg',
  bg1: '--color-bg-1',
  bg2: '--color-bg-2',
  bg3: '--color-bg-3',
  border: '--color-border',
  borderBright: '--color-border-bright',
  fg: '--color-fg',
  fgMute: '--color-fg-mute',
  fgDim: '--color-fg-dim',
  accent: '--color-accent',
  accent2: '--color-accent-2',
  warn: '--color-warn',
  bad: '--color-bad',
  good: '--color-good',
};

export function applyTheme(themeId: string) {
  const theme = getTheme(themeId);
  const root = document.documentElement;
  (Object.keys(theme.colors) as (keyof Theme['colors'])[]).forEach((key) => {
    root.style.setProperty(VAR_MAP[key], theme.colors[key]);
  });
  root.dataset.theme = theme.id;
}
