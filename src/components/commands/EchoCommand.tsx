import React from "react";
import { Command } from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

export const EchoCommand: Command = {
  name: "echo",
  description: "print out the text that follows",
  args: [],
  run: async (args: string, context: KeyPressContextType) => {
    if (!args) {
      return <p className="text-red-500">Usage: echo [text]</p>;
    }
    return <p>{"> "}{args}</p>;
  }
};

