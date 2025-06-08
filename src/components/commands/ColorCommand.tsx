import React from "react";
import { Command } from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

const isValidHexColor = (color: string): boolean => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
};

export const ColorCommand: Command = {
  name: "color",
  description: "set the color of the website",
  args: [],
  run: async (args: string, context: KeyPressContextType) => {
    if (args) {
        const splitArgs = args.split(" ");
        if (splitArgs[0] == "set" && splitArgs[1] != null) {
            if (!isValidHexColor(splitArgs[1])) {
                return (
                    <p className="text-red-500">Invalid hex color code. Please use format #RGB or #RRGGBB</p>
                );
            }
            document.documentElement.style.setProperty('--terminal', splitArgs[1]);
            return (
                <p>
                    <span>Setting color to </span>
                    <span style={{ color: splitArgs[1] }}>
                        {splitArgs[1]}
                    </span>
                </p>
            );
        } else if (splitArgs[0] == "get") {
            const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim();
            return (
                <p>
                    <span>Current color is </span>
                    <span style={{ color: currentColor }}>
                        {currentColor}
                    </span>
                </p>
            );
        } else if (splitArgs[0] == "reset") {
           // #22c55e
           document.documentElement.style.setProperty('--terminal', "#22c55e"); 
            return (
                <p>
                    <span>Setting color to </span>
                    <span className="text-terminal">
                        {getComputedStyle(document.documentElement).getPropertyValue('--terminal')}
                    </span>
                </p>
            );
        }
        return (
            <p className="text-red-500">Usage: color (set #color/get)</p>
        )
    } else {
        return (
            <p className="text-red-500">Usage: color (set #color/get)</p>
        )
    }
  }
};

