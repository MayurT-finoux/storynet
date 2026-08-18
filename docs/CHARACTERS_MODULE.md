# Characters Module

Characters are first-class objects that can be defined, edited, and automatically highlighted within page content. They also feed into the network export feature.

## Data Model
`src/types/character.ts` defines:
```ts
export interface Character {
  id: string;
  name: string;
  description: string;  // required, not optional
  image?: string;        // base64 or URL
  aliases?: string[];    // alternate names
}
```

## `CharacterModal` Component
Location: `src/components/CharacterModal.tsx`

### Purpose
A floating modal used to list, add, edit, delete and preview characters.

### Views
- **List view** – existing characters; clicking a row opens its preview, with separate Edit and Delete icon buttons per row (there's no dedicated "preview" button — the whole row is the preview trigger).
- **Form view** – create/update a character's name, description, image (via upload) and comma-separated aliases.
- **Preview view** – read-only card with character details.

### Props
```ts
interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onAddCharacter: (character: Omit<Character, 'id'>) => void;
  onUpdateCharacter: (id: string, character: Omit<Character, 'id'>) => void;
  onDeleteCharacter: (id: string) => void;
  darkMode?: boolean;
}
```
`darkMode` drives a `dm` color-lookup object used throughout the modal's inline styles, same pattern as `InfiniteCanvas.tsx`.

### Features
- Upload an image file; stored as a base64 string.
- Alias parsing: comma-separated aliases trimmed and filtered.
- The overlay behind the modal is a plain invisible click-outside-to-close layer — `position: fixed; inset: 0` with no background color or blur, not a dimmed/frosted backdrop.
- Slide-in animation on open (CSS keyframe `slideIn`, easing `cubic-bezier(0.16,1,0.3,1)`).

## Character Highlighting
`InfiniteCanvas.tsx` defines `highlightCharacters(text)`, which scans an HTML string for occurrences of each character's name or alias (longest names matched first, to avoid partial-match collisions) and wraps matches in a styled `<span>`:
```html
<span data-char="Name" style="color:#d32f2f;font-weight:bold;cursor:pointer;border-radius:3px;padding:0 2px">Name</span>
```
The `data-char` attribute is what drives the hover tooltip (avatar + name + truncated description) shown when hovering a highlighted name — see [Canvas Module](./CANVAS_MODULE.md).

**This only renders in one place**: the transparent overlay layer inside the page edit modal (see [Text & Page Module](./TEXT_MODULE.md)). The collapsed page card shown on the canvas itself renders raw `element.content` with no highlighting — you only see highlighted names while a page is open for editing.

## Network Generation / Import
- Characters feed into the simplified network export/import via `onGenerateNetwork`/`onImportNetwork`.
- The network schema itself is defined in `App.tsx`, not in this module.

---

The characters module is optional but enhances storytelling by giving entities semantic meaning and inter-page awareness.
