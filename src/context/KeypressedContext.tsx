'use client'

import React, { useState, useEffect, createContext, useRef, useCallback } from "react";

export type VimEditorConfig = {
  filename: string | null
  initialContent: string
  onSave: (filename: string, content: string) => { success: boolean; error?: string }
  onClose: () => void
}

export type TerminalShortcut = 'ctrl+r' | 'history-up' | 'history-down' | 'tab'

/** Raw keyboard input, delivered to subscribers synchronously from the key handler */
export type TerminalInputEvent =
  | { type: 'input'; text: string }
  | { type: 'shortcut'; name: TerminalShortcut }

export type KeyPressContextType = {
  text: string
  cursorPos: number
  setText: React.Dispatch<React.SetStateAction<string>>
  setCursorPos: React.Dispatch<React.SetStateAction<number>>
  clearText: () => void
  /** Subscribe to keyboard input; returns an unsubscribe function */
  subscribeInput: (listener: (event: TerminalInputEvent) => void) => () => void
  // Vim editor overlay state
  vimEditor: VimEditorConfig | null
  setVimEditor: React.Dispatch<React.SetStateAction<VimEditorConfig | null>>
  // Headless mode flag (for 3D terminal)
  headless?: boolean
}

export const KeyPressContext = createContext<KeyPressContextType | null>(null);

export type KeyPressProviderProps = {
  children: React.ReactNode;
  onKeyPress?: (key: string, event: KeyboardEvent) => void;
  headless?: boolean;
};

export const KeyPressProvider = ({ children, onKeyPress, headless = false }: KeyPressProviderProps) => {
  const [text, setText] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const textRef = useRef("");
  const cursorPosRef = useRef(0);
  const inputListenersRef = useRef(new Set<(event: TerminalInputEvent) => void>());
  const [vimEditor, setVimEditor] = useState<VimEditorConfig | null>(null);
  const vimEditorRef = useRef<VimEditorConfig | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    vimEditorRef.current = vimEditor;
  }, [vimEditor]);

  const clearText = () => {
    setText("");
    setCursorPos(0);
    textRef.current = "";
    cursorPosRef.current = 0;
  };

  const subscribeInput = useCallback((listener: (event: TerminalInputEvent) => void) => {
    inputListenersRef.current.add(listener);
    return () => {
      inputListenersRef.current.delete(listener);
    };
  }, []);

  const emit = (event: TerminalInputEvent) => {
    inputListenersRef.current.forEach((listener) => listener(event));
  };

  /** Commits an edit to the input line and notifies subscribers */
  const commitInput = (next: string, newCursor: number) => {
    setText(next);
    setCursorPos(newCursor);
    textRef.current = next;
    cursorPosRef.current = newCursor;
    emit({ type: 'input', text: next });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Skip terminal key handling when vim editor overlay is active
    // Vim has its own key handling via CodeMirror
    if (vimEditorRef.current) return;

    // Skip terminal key handling for native input elements
    // This allows chat textarea, forms, and other inputs to work normally
    // without the terminal capturing their keystrokes
    const target = e.target as HTMLElement;
    const tagName = target.tagName?.toUpperCase();
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable || target.closest('textarea, input, [contenteditable="true"]')) {
      return;
    }

    // Prevent space from scrolling the page (default browser behavior)
    if (e.code === "Space") {
      e.preventDefault();
    }

    // Allow Ctrl+V to pass through so browser paste event fires
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
      e.preventDefault();
      emit({ type: 'shortcut', name: 'ctrl+r' });
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
      clearText();
      emit({ type: 'input', text: '' });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      emit({ type: 'shortcut', name: 'history-up' });
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      emit({ type: 'shortcut', name: 'history-down' });
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      emit({ type: 'shortcut', name: 'tab' });
      return;
    }

    const currentText = textRef.current;
    const cursor = cursorPosRef.current;

    if (e.key.length === 1) {
      const next = currentText.slice(0, cursor) + e.key + currentText.slice(cursor);
      commitInput(next, cursor + 1);
    } else if (e.key === "Backspace") {
      if (cursor === 0) return;
      const next = currentText.slice(0, cursor - 1) + currentText.slice(cursor);
      commitInput(next, Math.max(0, cursor - 1));
    } else if (e.key === "Enter") {
      const next = currentText.slice(0, cursor) + "\n" + currentText.slice(cursor);
      commitInput(next, cursor + 1);
    } else if (e.key === "ArrowLeft") {
      const newCursor = Math.max(0, cursor - 1);
      setCursorPos(newCursor);
      cursorPosRef.current = newCursor;
    } else if (e.key === "ArrowRight") {
      const newCursor = Math.min(currentText.length, cursor + 1);
      setCursorPos(newCursor);
      cursorPosRef.current = newCursor;
    }
    if (onKeyPress) onKeyPress(e.key, e);
  };

  const handlePaste = (e: ClipboardEvent) => {
    // Skip terminal paste handling when vim editor is active
    if (vimEditorRef.current) return;

    // Skip terminal paste handling for input elements (chat, forms, etc.)
    const target = e.target as HTMLElement;
    const tagName = target.tagName?.toUpperCase();
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable || target.closest('textarea, input, [contenteditable="true"]')) {
      return;
    }

    e.preventDefault();
    const pasted = e.clipboardData?.getData("text");
    if (pasted) {
      const currentText = textRef.current;
      const cursor = cursorPosRef.current;
      const next = currentText.slice(0, cursor) + pasted + currentText.slice(cursor);
      commitInput(next, cursor + pasted.length);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    cursorPosRef.current = cursorPos;
  }, [cursorPos]);

  return (
    <KeyPressContext.Provider value={{ text, setText, clearText, cursorPos, setCursorPos, subscribeInput, vimEditor, setVimEditor, headless }}>
      {children}
    </KeyPressContext.Provider>
  );
};
