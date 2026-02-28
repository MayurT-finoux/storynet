# Characters Module

Characters are first‑class objects in StoryNet that can be defined, edited, and then automatically highlighted within page content. They also feed into a simple network export feature.

## Data Model
`src/types/character.ts` defines:
```ts
export interface Character {
  id: string;
  name: string;
  description?: string;
  image?: string;       // base64 or URL
  aliases?: string[];   // alternate names
}
```

## `CharacterModal` Component
Location: `src/components/CharacterModal.tsx`

### Purpose
A floating modal used to list, add, edit, delete and preview characters.

### Views
- **List view** – displays existing characters with buttons for edit, preview, and delete.
- **Form view** – allows creation or update of a character's name, description, image (via upload) and comma‑separated aliases.
- **Preview view** – shows a read‑only card with character details.

### Props
```ts
interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onAddCharacter: (character: Omit<Character, 'id'>) => void;
  onUpdateCharacter: (id: string, character: Omit<Character, 'id'>) => void;
  onDeleteCharacter: (id: string) => void;
}
```

### Features
- Upload an image file; stored as base64 string.
- Alias parsing: comma‑separated aliases trimmed and filtered.
- List entries include hover states and preview/edit buttons.
- Entire modal floats on the right side with blurred overlay background.
- Animation on open (`floatIn`).

## Character Highlighting
`InfiniteCanvas` exports `highlightCharacters(text)` which scans an HTML string for occurrences of each character name or alias (longest names first to avoid partial matches) and wraps matches in a styled `<span>`:
```ts
<span style="color: #d32f2f; font-weight: bold; background-color: #ffebee;">Name</span>
```
This is applied when rendering page content so that characters stand out.

## Network Generation / Import
- Characters can be exported as a simple network object via `onGenerateNetwork` and re‑imported with `onImportNetwork`.
- Details of the network schema are defined in `App.tsx` (or parent container) and are not part of the UI module itself.

---

The characters module is optional but enhances storytelling by giving entities semantic meaning and inter‑page awareness.