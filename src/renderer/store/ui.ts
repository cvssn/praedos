import { create } from 'zustand';

export type Screen = 'dashboard' | 'fissures' | 'market' | 'logfeed' | 'notes' | 'builds' | 'settings';

interface UIState {
  screen: Screen;
  setScreen: (s: Screen) => void;
}

export const useUI = create<UIState>((set) => ({
  screen: 'dashboard',
  setScreen: (screen) => set({ screen }),
}));
