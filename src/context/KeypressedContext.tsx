import React, { useState, useEffect, createContext } from "react";

type KeyPressContextType = {
  text: string
  setText: React.Dispatch<React.SetStateAction<string>>
  clearText: () => void
}

export const KeyPressContext = createContext<KeyPressContextType | null>(null);

export const KeyPressProvider = ({ children }) => {
  const [text, setText] = useState("");

  const clearText = () => {
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key.length === 1) {
      setText((prev) => prev + e.key);
    } else if (e.key === "Backspace") {
      setText((prev) => prev.slice(0, -1));
    } else if (e.key === "Enter") {
      setText((prev) => prev + "\n");
    }
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

