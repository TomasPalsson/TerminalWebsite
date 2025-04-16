import React from "react";
import Command from "./Command";
import { useNavigate } from "react-router";

export const ExitCommand: Command = {
  name: "exit",
  description: "Exit the terminal",
  run: () => {
    return (
      <span className="font-mono text-xl ">
        <div className="flex flex-col">
          <span>Exiting...</span>
        </div>
      </span>
    );
  },
};
