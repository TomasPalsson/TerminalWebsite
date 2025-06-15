import React from "react";
import Command from "./Command";

export const ExitCommand: Command = {
  name: "exit",
  description: "Exit the terminal",
  args : [],
  run: async () => {

    return (
      <span className="font-mono text-xl ">
        <div className="flex flex-col">
          <span>Exiting...</span>
        </div>
      </span>
    );
  },
};
