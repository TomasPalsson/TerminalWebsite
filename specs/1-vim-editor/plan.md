# Implementation Plan: Vim Editor

## Constitution Check

Before implementation, verify alignment with principles:

| Principle | Approach |
|-----------|----------|
| Documentation | JSDoc comments on VimEditor props, VimCommand interface; inline comments for Ex command handlers |
| Extensibility | VimCommand follows Command interface; VimEditor is a reusable component; Ex commands use defineEx API |
| Type Safety | VimEditorProps, VimEditorState, VimMode types defined; no implicit any |
| Separation | VimCommand (command registration) separate from VimEditor (UI); file operations delegated to fileSystem service |
| Style | Tailwind utilities for status bar styling; font-mono for editor; terminal green accents; 2-space indent |

## Implementation Steps

### Phase 1: Dependencies & Setup

- [ ] Install required packages: `@uiwjs/react-codemirror`, `@replit/codemirror-vim`, `@codemirror/state`, `@codemirror/view`
- [ ] Verify packages work with existing React/Vite setup
- [ ] Create types file `src/components/commands/vim/types.ts`

### Phase 2: VimEditor Component

- [ ] Create `src/components/commands/vim/VimEditor.tsx`
- [ ] Implement basic CodeMirror setup with vim extension
- [ ] Add dark theme styling to match terminal aesthetic
- [ ] Implement status bar (mode indicator, filename, line:col, modified indicator)
- [ ] Wire up onChange to track modified state

### Phase 3: Ex Commands Integration

- [ ] Implement `:w` (write) - save to mock filesystem
- [ ] Implement `:q` (quit) - close editor with unsaved check
- [ ] Implement `:wq` / `:x` - save and quit
- [ ] Implement `:q!` - force quit without saving
- [ ] Add status messages for success/error feedback

### Phase 4: VimCommand & Terminal Integration

- [ ] Create `src/components/commands/vim/VimCommand.tsx`
- [ ] Register VimCommand in CommandMap.tsx
- [ ] Add vim to HelpCommand categories
- [ ] Implement terminal overlay mode for fullscreen editor
- [ ] Handle editor close and return to terminal

### Phase 5: Polish & Testing

- [ ] Test all vim motions (h,j,k,l,w,b,e,0,$,gg,G)
- [ ] Test mode switching (i,a,o,O,Escape)
- [ ] Test editing commands (x,dd,yy,p,u)
- [ ] Test file operations (new file, existing file, save, save-as)
- [ ] Test edge cases (quit with unsaved changes, invalid paths)
- [ ] Verify visual consistency with terminal theme

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/commands/vim/types.ts` | Create | TypeScript interfaces for VimEditor |
| `src/components/commands/vim/VimEditor.tsx` | Create | Main editor component with CodeMirror |
| `src/components/commands/vim/VimCommand.tsx` | Create | Terminal command that spawns editor |
| `src/components/commands/vim/vimTheme.ts` | Create | CodeMirror theme matching terminal aesthetic |
| `src/components/commands/vim/index.ts` | Create | Barrel export |
| `src/components/commands/CommandMap.tsx` | Modify | Register VimCommand |
| `src/components/commands/HelpCommand.tsx` | Modify | Add vim to command categories |
| `src/screens/Terminal.tsx` | Modify | Support fullscreen editor overlay |
| `package.json` | Modify | Add new dependencies |

## Testing Strategy

- [ ] Manual verification: Open vim, type content, save with :wq, verify file in filesystem
- [ ] Manual verification: Edit existing file, modify, save, verify changes persisted
- [ ] Manual verification: All listed keybindings work (navigation, editing, mode switching)
- [ ] Manual verification: :q with unsaved changes shows warning
- [ ] Manual verification: :q! discards changes
- [ ] Manual verification: Editor matches terminal theme (dark bg, green accents)

## Rollback Plan

1. Dependencies are additive - can remove from package.json
2. VimCommand registration can be removed from CommandMap
3. All vim-related files are in isolated `vim/` directory - can delete entire folder
4. Terminal.tsx changes are localized to editor overlay logic - can revert
5. No database/persistent state changes outside existing localStorage patterns

## Dependencies

**New packages:**
- `@uiwjs/react-codemirror` - React wrapper for CodeMirror 6
- `@replit/codemirror-vim` - Vim keybindings extension
- `@codemirror/state` - CodeMirror state management (peer dep)
- `@codemirror/view` - CodeMirror view layer (peer dep)

**Existing services used:**
- `fileSystem` - Read/write files to mock filesystem
- `KeyPressContext` - May need to pause terminal key handling when editor is open
