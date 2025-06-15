import React, { useState, useEffect, createContext } from "react";

export type KeyPressContextType = {
  text: string
  setText: React.Dispatch<React.SetStateAction<string>>
  clearText: () => void
}

export const KeyPressContext = createContext<KeyPressContextType | null>(null);

export type KeyPressProviderProps = {
  children: React.ReactNode;
  onKeyPress?: (key: string, event: KeyboardEvent) => void;
};

export const KeyPressProvider = ({ children, onKeyPress }: KeyPressProviderProps) => {
  const [text, setText] = useState("");

  const clearText = () => {
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {

    if (e.code === "Space") {
      e.preventDefault();
    }


    if (e.key.length === 1) {
      setText((prev) => prev + e.key);
    } else if (e.key === "Backspace") {
      setText((prev) => prev.slice(0, -1));
    } else if (e.key === "Enter") {
      setText((prev) => prev + "\n");
    }
    if (onKeyPress) onKeyPress(e.key, e);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <KeyPressContext.Provider value={{ text, setText , clearText }}>
      {children}
    </KeyPressContext.Provider>
  );
};

