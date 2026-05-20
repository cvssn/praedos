import { useEffect } from 'react';
import { applyTheme } from './lib/theme';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { DashboardScreen } from './screens/Dashboard';
import { FissuresScreen } from './screens/Fissures';
import { StarChartScreen } from './screens/StarChart';
import { MarketScreen } from './screens/Market';
import { LogFeedScreen } from './screens/LogFeed';
import { NotesScreen } from './screens/Notes';
import { BuildsScreen } from './screens/Builds';
import { SettingsScreen } from './screens/Settings';
import { useUI } from './store/ui';

const SCREEN_TITLES: Record<string, string> = {
  dashboard: 'World State',
  fissures: 'Void Fissures',
  starchart: 'Star Chart',
  market: 'Warframe.Market',
  logfeed: 'Live Log Feed',
  notes: 'Notes & Goals',
  builds: 'Personal Builds',
  settings: 'Settings',
};

export default function App() {
  const screen = useUI((s) => s.screen);

  useEffect(() => {
    document.title = `Praedos · ${SCREEN_TITLES[screen]}`;
  }, [screen]);

  useEffect(() => {
    window.praedos.settings.get().then((s) => applyTheme(s.theme));
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <TitleBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="px-6 pt-5 pb-3 border-b border-border bg-bg-1/40 backdrop-blur-md">
            <h1 className="font-display text-2xl tracking-wide text-fg">{SCREEN_TITLES[screen]}</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-6">
            {screen === 'dashboard' && <DashboardScreen />}
            {screen === 'fissures' && <FissuresScreen />}
            {screen === 'starchart' && <StarChartScreen />}
            {screen === 'market' && <MarketScreen />}
            {screen === 'logfeed' && <LogFeedScreen />}
            {screen === 'notes' && <NotesScreen />}
            {screen === 'builds' && <BuildsScreen />}
            {screen === 'settings' && <SettingsScreen />}
          </div>
        </main>
      </div>
    </div>
  );
}
