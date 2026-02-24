# Rich Editor Upgrade Plan

## Current State Analysis

### Editor (Frontend)
- **TipTap v2.9.1** with React integration
- **Extensions**: StarterKit (bold, italic, strike, heading 1-5, blockquote, code, codeBlock, lists, horizontalRule, history), Image, Link, TextStyle, Underline, TextAlign
- **Toolbar**: Bold, Italic, Underline, Strike, Align (L/C/R/J), Image upload, Link (prompt-based), Bullet/Ordered list, Heading dropdown (1-5), Blockquote, Clear format
- **Missing**: Code block button, Horizontal rule button, Color/Highlight, Table, Embed (YouTube/Twitter), Drag-and-drop, Slash commands, Bubble menu, Floating menu, Image resize/caption, better link UI

### Backend (Go)
- `post_contents.content` = JSONB (TipTap document tree)
- `ProcessJSONContent()` / `ProcessJSONContentForDisplay()` handle image URL ↔ `dataImageId` swapping
- `extract_text_from_json_doc()` SQL function for full-text search
- `walkJSONTree()` recursive visitor pattern for JSON processing
- No JSON schema validation

### Rendering (Frontend)
- `renderContent.js` uses `generateHTML()` from `@tiptap/html` with shared extensions
- `tiptapExtensions.js` centralizes extension config (shared between editor & renderer)
- Tailwind Typography (`prose`) + custom CSS for reading experience
- Code blocks have basic styling but **no syntax highlighting**

---

## Upgrade Plan

### Phase 1: TipTap Extensions — New Node Types
Add extensions to `tiptapExtensions.js` (shared config) and install packages.

**New extensions:**
| Extension | Package | Purpose |
|-----------|---------|---------|
| CodeBlockLowlight | `@tiptap/extension-code-block-lowlight` + `lowlight` | Syntax-highlighted code blocks with language selector |
| Table + TableRow + TableHeader + TableCell | `@tiptap/extension-table` family | Tables |
| Youtube | `@tiptap/extension-youtube` | YouTube embed |
| Highlight | `@tiptap/extension-highlight` | Text highlight (background color) |
| Color | `@tiptap/extension-color` | Text color |
| Subscript | `@tiptap/extension-subscript` | Subscript text |
| Superscript | `@tiptap/extension-superscript` | Superscript text |
| TaskList + TaskItem | `@tiptap/extension-task-list` + `@tiptap/extension-task-item` | Checkbox lists |
| Placeholder | (already installed) | Already used in PostForm |
| CharacterCount | `@tiptap/extension-character-count` | Word/char count display |
| Typography | `@tiptap/extension-typography` | Smart quotes, dashes, ellipsis auto-replace |

**Replace StarterKit's CodeBlock** with `CodeBlockLowlight` (disable `codeBlock` in StarterKit config).

**Impact on JSON structure**: New node types will appear in the document tree:
```json
{ "type": "table", "content": [{ "type": "tableRow", "content": [...] }] }
{ "type": "codeBlock", "attrs": { "language": "javascript" }, "content": [...] }
{ "type": "youtube", "attrs": { "src": "https://youtube.com/...", "width": 640, "height": 480 } }
{ "type": "taskList", "content": [{ "type": "taskItem", "attrs": { "checked": false }, "content": [...] }] }
{ "type": "text", "marks": [{ "type": "highlight", "attrs": { "color": "#fef08a" } }] }
{ "type": "text", "marks": [{ "type": "textStyle", "attrs": { "color": "#ef4444" } }] }
```

**Files changed:**
- `frontend/utils/tiptapExtensions.js` — add all new extensions
- `frontend/package.json` — new dependencies
- `frontend/components/Editor/PostForm.js` — CodeBlockLowlight replaces StarterKit's codeBlock in editor-specific config

### Phase 2: Toolbar Redesign — Grouped & Feature-Rich
Redesign the toolbar with logical groups, separators, and new buttons.

**New toolbar layout:**
```
[B] [I] [U] [S] | [H▼] [Color▼] [Highlight▼] | [BulletList] [OrderedList] [TaskList] | 
[AlignL] [AlignC] [AlignR] [AlignJ] | [Link] [Image] [YouTube] [Table] | 
[Blockquote] [Code] [CodeBlock▼] [HorizontalRule] | [Sub] [Sup] [ClearFormat] | [Undo] [Redo]
```

**New components:**
- `ToolbarSeparator.js` — vertical divider between groups
- `ColorPicker.js` — reusable color picker dropdown (for Color and Highlight)
- `LinkDialog.js` — proper link insertion dialog (replace `prompt()`)
- `YouTubeDialog.js` — YouTube URL input dialog
- `TableMenu.js` — table insertion grid (rows × cols picker)
- `CodeBlockSelector.js` — language selector dropdown for code blocks

**Refactor `PostForm.js`**: Extract `menuBar` definition into a separate `useToolbarItems.js` hook for cleanliness.

**Files changed:**
- `frontend/components/Editor/PostForm.js` — simplified, uses hook
- `frontend/components/Editor/Toolbar.js` — support separators, groups
- `frontend/components/Editor/ToolbarButton.js` — minor adjustments
- `frontend/components/Editor/ToolbarSeparator.js` — new
- `frontend/components/Editor/ColorPicker.js` — new
- `frontend/components/Editor/LinkDialog.js` — new
- `frontend/components/Editor/YouTubeDialog.js` — new
- `frontend/components/Editor/TableMenu.js` — new
- `frontend/components/Editor/CodeBlockSelector.js` — new
- `frontend/hooks/useToolbarItems.js` — new (extracted from PostForm)

### Phase 3: Bubble Menu & Floating Menu
Add context-aware menus that appear on text selection or empty lines.

**Bubble Menu** (appears on text selection):
- Bold, Italic, Underline, Strike, Link, Color, Highlight, Clear format
- Uses `@tiptap/react`'s `BubbleMenu` component (already in `@tiptap/react`)

**Floating Menu** (appears on empty new lines):
- Heading, Image, Code block, Table, YouTube, Horizontal rule, Task list
- Uses `@tiptap/react`'s `FloatingMenu` component (already in `@tiptap/react`)

**Files changed:**
- `frontend/components/Editor/BubbleToolbar.js` — new
- `frontend/components/Editor/FloatingToolbar.js` — new
- `frontend/components/Editor/PostForm.js` — integrate both menus

### Phase 4: Image Enhancements
Improve image handling in the editor.

**Features:**
- **Drag & drop** image upload (TipTap supports this via `handleDrop`)
- **Paste** image from clipboard (TipTap supports via `handlePaste`)
- **Image resize** handles (custom extension or `@tiptap/extension-image` with resize)
- **Image caption** (custom node extending Image)
- **Image alignment** (left, center, right, full-width)

**Approach:** Create a custom `ImageBlock` extension that extends TipTap's Image with:
- `caption` attribute
- `alignment` attribute (`left` | `center` | `right` | `full`)
- `width` attribute (for resize)
- Custom NodeView with resize handles and caption input

**JSON structure:**
```json
{
  "type": "imageBlock",
  "attrs": {
    "src": "...",
    "alt": "...",
    "caption": "Photo by ...",
    "alignment": "center",
    "width": "80%"
  }
}
```

**Files changed:**
- `frontend/components/Editor/extensions/ImageBlock.js` — custom TipTap extension
- `frontend/components/Editor/extensions/ImageBlockView.js` — custom NodeView (React component)
- `frontend/components/Editor/PostForm.js` — add drop/paste handlers
- `frontend/utils/tiptapExtensions.js` — replace `Image` with `ImageBlock`

### Phase 5: Backend — JSON Validation & New Node Support
Update backend to handle new node types properly.

**Changes:**
1. **Update `walkJSONTree`** — already handles all node types recursively (no change needed for basic walking)
2. **Update `ProcessJSONContent`** — handle `imageBlock` type (in addition to `image`) for `dataImageId` swapping
3. **Update `ExtractImageIDsFromJSON`** — handle `imageBlock` type
4. **Update `extract_text_from_json_doc` SQL function** — already handles all text nodes recursively (no change needed)
5. **Add JSON validation** — validate that incoming content has `type: "doc"` root and known node types (optional, defensive)
6. **Update excerpt extraction** — `ExtractPlainTextFromJSON` already works for any text nodes (no change needed)

**Files changed:**
- `backend/application/pkg/storage/manager.go` — update image processing to handle `imageBlock` type
- `backend/migrate/scripts/001_initial_setup.sql` — no change needed (function is generic)

### Phase 6: Rendering & Display Styles
Update content rendering and CSS for new node types.

**Changes:**
1. **`renderContent.js`** — already uses `generateHTML()` with shared extensions, so new extensions auto-render
2. **Syntax highlighting CSS** — add highlight.js/lowlight theme CSS for code blocks
3. **Table styles** — add CSS for rendered tables
4. **YouTube embed styles** — responsive iframe wrapper
5. **Task list styles** — checkbox styling
6. **Image caption styles** — figcaption styling
7. **Highlight/Color styles** — already handled by TipTap's inline styles

**Files changed:**
- `frontend/styles/globals.css` — add styles for tables, code highlighting, task lists, image captions, YouTube embeds
- `frontend/utils/renderContent.js` — no logic change needed (extensions handle it)

### Phase 7: Slash Commands (Optional Enhancement)
Add Medium/Notion-style `/` commands for quick insertion.

**Behavior:** Type `/` on empty line → dropdown with:
- `/heading` → Insert heading
- `/image` → Upload image
- `/code` → Insert code block
- `/table` → Insert table
- `/youtube` → Insert YouTube
- `/quote` → Insert blockquote
- `/divider` → Insert horizontal rule
- `/tasklist` → Insert task list

**Implementation:** Use TipTap's `@tiptap/suggestion` extension with a custom renderer.

**Files changed:**
- `frontend/components/Editor/extensions/SlashCommands.js` — suggestion extension config
- `frontend/components/Editor/SlashCommandsList.js` — dropdown UI component
- `frontend/utils/tiptapExtensions.js` — add to editor-only extensions

---

## Cursor Rules Updates

### New Rule: `editor-rule.mdc`
Create a dedicated cursor rule for the Editor components:

```
Scope: frontend/components/Editor/**, frontend/utils/tiptapExtensions.js, frontend/hooks/useToolbarItems.js

- All TipTap extensions MUST be registered in tiptapExtensions.js (shared between editor and renderer)
- Editor-only extensions (Placeholder, Slash commands) go in PostForm.js or useToolbarItems.js
- Every new node type MUST have corresponding CSS in globals.css for reading view
- Image nodes use dataImageId (not src) when saved to backend
- Custom extensions go in frontend/components/Editor/extensions/
- Use Vietnamese for all tooltip text
- Toolbar buttons use ToolbarButton.js component
- Dialogs (link, youtube, table) are separate components in Editor/
```

### Update: `nextjs-rule.mdc`
Add editor-specific section:
```
- TipTap extensions are centralized in utils/tiptapExtensions.js
- Editor components live in components/Editor/
- Custom TipTap NodeViews use React components
- Content rendering uses generateHTML() from @tiptap/html with shared extensions
```

### Update: `go-rule.mdc`
Add content processing section:
```
- Post content is stored as TipTap/ProseMirror JSON document tree (JSONB)
- Image URLs are swapped to dataImageId on save, restored on display
- walkJSONTree() visitor pattern handles all JSON tree operations
- New node types with images must be handled in ProcessJSONContent/ProcessJSONContentForDisplay
```

---

## Implementation Order

| Phase | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 1 | TipTap Extensions — New Node Types | Medium | None |
| 2 | Toolbar Redesign | Large | Phase 1 |
| 3 | Bubble Menu & Floating Menu | Small | Phase 1 |
| 4 | Image Enhancements | Medium | Phase 1 |
| 5 | Backend — JSON Validation & New Node Support | Small | Phase 4 |
| 6 | Rendering & Display Styles | Medium | Phase 1, 4 |
| 7 | Slash Commands (Optional) | Medium | Phase 1 |

**Recommended order:** 1 → 2 → 3 → 6 → 4 → 5 → 7

Phase 1 first (foundation), then 2+3 (toolbar UX), then 6 (display), then 4+5 (image upgrade), then 7 (nice-to-have).

---

## Questions for Confirmation

1. **Phase 4 — ImageBlock**: Should we create a custom `imageBlock` extension (with caption, alignment, resize) or keep the basic `Image` extension? Custom = more work but much richer. **Recommendation: custom imageBlock.**

2. **Phase 7 — Slash Commands**: Include in scope or defer to a future iteration? **Recommendation: include, it's a major UX improvement.**

3. **Color palette**: Should Color and Highlight use a fixed palette (8-12 preset colors like Notion) or a full color picker? **Recommendation: fixed palette for simplicity.**

4. **Code block languages**: Which languages to support in the selector? **Recommendation: JavaScript, TypeScript, Python, Go, Rust, Java, C/C++, HTML, CSS, SQL, Bash, JSON, YAML, Markdown, PHP, Ruby, Swift, Kotlin — plus "Plain text" and "Auto-detect".**

5. **Table features**: Basic table (insert, add/remove rows/cols) or advanced (merge cells, resize columns)? **Recommendation: basic first.**

6. **Existing cursor rules**: The current `go-rule.mdc` and `golang-rule.mdc` have overlapping scope. Should I merge them into one? **Recommendation: merge into single `go-rule.mdc`.**
