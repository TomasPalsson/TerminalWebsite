import React from "react";
import Command from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

export const EchoCommand: Command = {
  name: "echo",
  description: "print out the text that follows",
  usage: (
    <p className="text-terminal">Usage: <span className="text-white">echo [text]</span></p>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    if (!args || args.length === 0) {
      return <p className="text-red-500">Usage: echo [text]</p>;
    }
    return <p>{"> "}{args.join(" ")}</p>;
  }
};

