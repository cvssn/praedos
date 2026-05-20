import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, X, Image as ImageIcon, Pencil, Wrench, Upload } from 'lucide-react';
import { Empty } from '@/components/Empty';
import { cn } from '@/lib/utils';
import type { BuildCategory, BuildInput, BuildItem } from '@shared/types';

const CATEGORIES: { value: BuildCategory; label: string }[] = [
  { value: 'warframe', label: 'Warframe' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'melee', label: 'Melee' },
  { value: 'archwing', label: 'Archwing' },
  { value: 'companion', label: 'Companion' },
  { value: 'other', label: 'Other' },
];

const EMPTY_INPUT: BuildInput = {
  name: '',
  category: 'warframe',
  loadout: '',
  mods: '',
  notes: '',
  imagePath: undefined,
};

export function BuildsScreen() {
  const [builds, setBuilds] = useState<BuildItem[]>([]);
  const [editing, setEditing] = useState<BuildItem | null>(null);
  const [draft, setDraft] = useState<BuildInput>(EMPTY_INPUT);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<BuildCategory | 'all'>('all');

  useEffect(() => {
    window.praedos.builds.list().then(setBuilds);
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? builds : builds.filter((b) => b.category === filter)),
    [builds, filter],
  );

  function openNew() {
    setEditing(null);
    setDraft(EMPTY_INPUT);
    setShowForm(true);
  }

  function openEdit(b: BuildItem) {
    setEditing(b);
    setDraft({
      name: b.name,
      category: b.category,
      loadout: b.loadout,
      mods: b.mods,
      notes: b.notes,
      imagePath: b.imagePath,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setDraft(EMPTY_INPUT);
  }

  async function save() {
    if (!draft.name.trim()) return;
    const next = editing
      ? await window.praedos.builds.update(editing.id, draft)
      : await window.praedos.builds.add(draft);
    setBuilds(next);
    closeForm();
  }

  async function remove(id: string) {
    setBuilds(await window.praedos.builds.remove(id));
  }

  async function uploadImage() {
    const p = await window.praedos.builds.pickImage();
    if (p) setDraft((d) => ({ ...d, imagePath: p }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={openNew}
          className="chip bg-accent/15 border-accent/40 text-accent hover:bg-accent/25 flex items-center gap-1.5"
        >
          <Plus size={14} />
          New Build
        </button>
        <div className="flex items-center gap-1 ml-2 flex-wrap">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.value}
              active={filter === c.value}
              onClick={() => setFilter(c.value)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
        <span className="ml-auto text-xs text-fg-dim">
          {filtered.length} / {builds.length}
        </span>
      </div>

      {showForm && (
        <BuildForm
          draft={draft}
          setDraft={setDraft}
          editing={!!editing}
          onSave={save}
          onCancel={closeForm}
          onUpload={uploadImage}
        />
      )}

      {filtered.length === 0 ? (
        <Empty
          title="No builds yet"
          hint="Click 'New Build' to save your first loadout."
          icon={<Wrench size={28} />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((b) => (
            <BuildCard key={b.id} build={b} onEdit={() => openEdit(b)} onRemove={() => remove(b.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'chip text-xs transition-colors',
        active ? 'text-accent border-accent/50 bg-accent/10' : 'text-fg-mute hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}

function BuildForm({
  draft,
  setDraft,
  editing,
  onSave,
  onCancel,
  onUpload,
}: {
  draft: BuildInput;
  setDraft: React.Dispatch<React.SetStateAction<BuildInput>>;
  editing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-display tracking-wide text-fg">
          {editing ? 'Edit Build' : 'New Build'}
        </h2>
        <button onClick={onCancel} className="ml-auto text-fg-dim hover:text-fg">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Name">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Saryn Steel Path"
            className="input"
            autoFocus
          />
        </Field>
        <Field label="Category">
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as BuildCategory })}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Loadout">
        <input
          value={draft.loadout}
          onChange={(e) => setDraft({ ...draft, loadout: e.target.value })}
          placeholder="Frame / weapon / arcane combination"
          className="input"
        />
      </Field>

      <Field label="Mods">
        <textarea
          value={draft.mods}
          onChange={(e) => setDraft({ ...draft, mods: e.target.value })}
          placeholder={'One per line:\nUmbral Intensify\nTransient Fortitude\n…'}
          rows={6}
          className="input font-mono text-xs"
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="Playstyle, helminth subsume, arcanes, situational tips…"
          rows={3}
          className="input"
        />
      </Field>

      <Field label="Image">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUpload}
            className="chip flex items-center gap-1.5 hover:text-accent"
          >
            <Upload size={13} />
            {draft.imagePath ? 'Replace image' : 'Upload image'}
          </button>
          {draft.imagePath && (
            <>
              <span className="text-xs text-fg-dim truncate flex-1">{draft.imagePath}</span>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, imagePath: undefined })}
                className="text-fg-dim hover:text-bad"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </Field>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={!draft.name.trim()}
          className="chip text-accent bg-accent/10 border-accent/40 hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Save size={14} />
          Save
        </button>
        <button onClick={onCancel} className="chip text-fg-mute hover:text-fg">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] uppercase tracking-wider text-fg-dim">{label}</span>
      {children}
    </label>
  );
}

function BuildCard({
  build,
  onEdit,
  onRemove,
}: {
  build: BuildItem;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (build.imagePath) {
      window.praedos.builds.readImage(build.imagePath).then((url) => {
        if (!cancelled) setImgUrl(url);
      });
    } else {
      setImgUrl(null);
    }
    return () => {
      cancelled = true;
    };
  }, [build.imagePath]);

  const modList = build.mods
    .split('\n')
    .map((m) => m.trim())
    .filter(Boolean);

  return (
    <div className="surface-2 p-3 flex flex-col gap-2 group">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display tracking-wide text-fg truncate">{build.name}</h3>
            <span className="chip text-[10px] text-accent border-accent/40">{build.category}</span>
          </div>
          {build.loadout && (
            <p className="text-xs text-fg-mute truncate mt-0.5">{build.loadout}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-fg-dim hover:text-accent" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={onRemove} className="text-fg-dim hover:text-bad" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {imgUrl ? (
        <img
          src={imgUrl}
          alt={build.name}
          className="w-full h-32 object-cover rounded-md border border-border"
        />
      ) : build.imagePath ? (
        <div className="w-full h-32 rounded-md border border-border bg-bg-1 flex items-center justify-center text-fg-dim">
          <ImageIcon size={20} />
        </div>
      ) : null}

      {modList.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {modList.slice(0, 8).map((m, i) => (
            <li
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded bg-bg-1 border border-border text-fg-mute"
            >
              {m}
            </li>
          ))}
          {modList.length > 8 && (
            <li className="text-[10px] px-1.5 py-0.5 text-fg-dim">+{modList.length - 8} more</li>
          )}
        </ul>
      )}

      {build.notes && (
        <p className="text-xs text-fg-mute whitespace-pre-wrap line-clamp-3">{build.notes}</p>
      )}
    </div>
  );
}
