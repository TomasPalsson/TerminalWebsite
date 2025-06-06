import React from "react";
import {Command} from "./Command";
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
      <div className="font-mono text-sm text-xl leading-relaxed text-gray-200 whitespace-pre">
        <div className="text-cyan-400">Available commands:</div>
        {builtInCommands.map((cmd) => (
          <div key={cmd.name}>
            <span className="font-bold text-terminal">  ❯ {cmd.name.padEnd(12)}</span>
            <span className="pr-5 text-gray-400">{cmd.desc}</span>
            {cmd.args ? <span className="text-gray-400"><i>Args: [{cmd.args?.join(',')}]</i></span> : null}
          </div>
        ))}
      </div>
    );
  },
};

