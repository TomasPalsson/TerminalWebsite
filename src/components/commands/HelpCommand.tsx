import React from "react";
import Command from "./Command";
import { commandMap } from "./CommandMap";

export const HelpCommand: Command = {
  name: "help",
  description: "List all available commands",
  run: () => {
    const builtInCommands = [
      { name: "clear", desc: "Clear the terminal screen" },
      ...[...commandMap.keys()].map((cmd) => ({
        name: cmd,
        args: commandMap.get(cmd)?.args,
        desc: commandMap.get(cmd)?.description,
      })),
    ];

    return (
      <div className="font-mono text-sm text-gray-200 text-xl whitespace-pre leading-relaxed">
        <div className="text-cyan-400">Available commands:</div>
        {builtInCommands.map((cmd) => (
          <div key={cmd.name}>
            <span className="text-terminal font-bold">  ❯ {cmd.name.padEnd(12)}</span>
            <span className="text-gray-400 pr-5">{cmd.desc}</span>
            {cmd.args ? <span className="text-gray-400"><i>Args: [{cmd.args?.join(',')}]</i></span> : null}
          </div>
        ))}
      </div>
    );
  },
};

