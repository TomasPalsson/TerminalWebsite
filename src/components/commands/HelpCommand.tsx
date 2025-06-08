import React from "react";
import {Command} from "./Command";
import { commandMap } from "./CommandMap";

export const HelpCommand: Command = {
  name: "help",
  description: "List all available commands",
  args: [],
  run: async (args: string[]) => {
    if (args.length > 0) {
      const command = commandMap.get(args[0]);
      if (command) {
        return (
          <div className="font-mono text-sm text-xl leading-relaxed text-gray-200 whitespace-pre">
            {command.usage || <p>No usage information available for this command.</p>}
          </div>
        );
      } else {
        return (
          <div className="font-mono text-sm text-xl leading-relaxed text-gray-200 whitespace-pre">
            <p className="text-red-500">Command not found: {args[0]}</p>
          </div>
        );
      }
    }

    const builtInCommands = [
      { name: "clear", desc: "Clear the terminal screen", args: [] },
      ...[...commandMap.keys()].map((cmd) => {
        const command = commandMap.get(cmd);
        return {
          name: cmd,
          args: command?.args || [],
          desc: command?.description || "",
        };
      }),
    ];

    return (
      <div className="font-mono text-sm text-xl leading-relaxed text-gray-200 whitespace-pre">
        <div className="text-cyan-400">Available commands:</div>
        {builtInCommands.map((cmd) => (
          <div key={cmd.name}>
            <span className="font-bold text-terminal">  ❯ {cmd.name.padEnd(12)}</span>
            <span className="pr-5 text-gray-400">{cmd.desc}</span>
          </div>
        ))}
        <br />
        <p className="text-gray-400">Type <span className="text-terminal">help [command]</span> to get details about a specific command.</p>
      </div>
    );
  },
};

