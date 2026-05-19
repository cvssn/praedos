import { useEffect, useRef, useState } from 'react';
import { Plus, Check, Trash2, ListChecks } from 'lucide-react';
import { Empty } from '@/components/Empty';
import { cn } from '@/lib/utils';
import type { NoteItem } from '@shared/types';

export function NotesScreen() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.praedos.notes.list().then(setNotes);
  }, []);

  async function add() {
    const t = draft.trim();
    if (!t) return;
    const next = await window.praedos.notes.add(t);
    setNotes(next);
    setDraft('');
    inputRef.current?.focus();
  }

  async function toggle(id: string) {
    setNotes(await window.praedos.notes.toggle(id));
  }

  async function remove(id: string) {
    setNotes(await window.praedos.notes.remove(id));
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="surface px-3 py-2 flex items-center gap-2">
        <Plus size={16} className="text-fg-mute" />
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a goal, farm target, riven roll plan…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-fg-dim"
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="chip text-accent hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {notes.length === 0 ? (
        <Empty title="No notes yet" hint="Press Enter to save your first goal." icon={<ListChecks size={28} />} />
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className={cn(
                'surface-2 px-3 py-2 flex items-center gap-3 group transition-colors',
                n.done && 'opacity-60',
              )}
            >
              <button
                onClick={() => toggle(n.id)}
                className={cn(
                  'w-5 h-5 rounded-md border flex items-center justify-center transition-colors',
                  n.done ? 'bg-good/20 border-good text-good' : 'border-border-bright hover:border-accent',
                )}
              >
                {n.done && <Check size={12} />}
              </button>
              <span className={cn('flex-1 text-sm', n.done && 'line-through text-fg-mute')}>{n.text}</span>
              <button
                onClick={() => remove(n.id)}
                className="opacity-0 group-hover:opacity-100 text-fg-dim hover:text-bad transition-all"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
