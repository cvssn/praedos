export const FACTION_DAMAGE: Record<string, string[]> = {
  Grineer: ['Corrosive', 'Viral', 'Slash', 'Impact'],
  Corpus: ['Magnetic', 'Toxin', 'Impact', 'Puncture'],
  Infested: ['Heat', 'Gas', 'Slash', 'Corrosive'],
  Corrupted: ['Radiation', 'Magnetic', 'Slash'],
  Sentient: ['Radiation', 'Tau'],
  Narmer: ['Radiation', 'Magnetic', 'Slash'],
  Murmur: ['Magnetic', 'Radiation', 'Slash'],
  Crossfire: ['Slash', 'Magnetic'],
  Orokin: ['Radiation', 'Magnetic'],
  Tenno: ['—'],
  'The Murmur': ['Magnetic', 'Radiation', 'Slash'],
};

export function damageFor(faction: string): string[] {
  return FACTION_DAMAGE[faction] ?? FACTION_DAMAGE[faction?.replace(/^The\s+/i, '')] ?? ['—'];
}
