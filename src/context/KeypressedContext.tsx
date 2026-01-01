import React, { useState, useEffect, createContext, useRef } from "react";

export type KeyPressContextType = {
  text: string
  cursorPos: number
  setText: React.Dispatch<React.SetStateAction<string>>
  setCursorPos: React.Dispatch<React.SetStateAction<number>>
  clearText: () => void
}

export const KeyPressContext = createContext<KeyPressContextType | null>(null);

export type KeyPressProviderProps = {
  children: React.ReactNode;
  onKeyPress?: (key: string, event: KeyboardEvent) => void;
};

export const KeyPressProvider = ({ children, onKeyPress }: KeyPressProviderProps) => {
  const [text, setText] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const textRef = useRef("");
  const cursorPosRef = useRef(0);

  const clearText = () => {
    setText("");
    setCursorPos(0);
    textRef.current = "";
    cursorPosRef.current = 0;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
      clearText();
      return;
    }

    const currentText = textRef.current;
    const cursor = cursorPosRef.current;

    if (e.key.length === 1) {
      const next = currentText.slice(0, cursor) + e.key + currentText.slice(cursor);
      const newCursor = cursor + 1;
      setText(next);
      setCursorPos(newCursor);
      textRef.current = next;
      cursorPosRef.current = newCursor;
    } else if (e.key === "Backspace") {
      if (cursor === 0) return;
      const next = currentText.slice(0, cursor - 1) + currentText.slice(cursor);
      const newCursor = Math.max(0, cursor - 1);
      setText(next);
      setCursorPos(newCursor);
      textRef.current = next;
      cursorPosRef.current = newCursor;
    } else if (e.key === "Enter") {
      const next = currentText.slice(0, cursor) + "\n" + currentText.slice(cursor);
      const newCursor = cursor + 1;
      setText(next);
      setCursorPos(newCursor);
      textRef.current = next;
      cursorPosRef.current = newCursor;
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
    e.preventDefault();
    const pasted = e.clipboardData?.getData("text");
    if (pasted) {
      const currentText = textRef.current;
      const cursor = cursorPosRef.current;
      const next = currentText.slice(0, cursor) + pasted + currentText.slice(cursor);
      const newCursor = cursor + pasted.length;
      setText(next);
      setCursorPos(newCursor);
      textRef.current = next;
      cursorPosRef.current = newCursor;
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
    <KeyPressContext.Provider value={{ text, setText , clearText, cursorPos, setCursorPos }}>
      {children}
    </KeyPressContext.Provider>
  );
};
