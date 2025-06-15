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
    usage: (
        <>
            <p className="font-bold text-terminal">Usage:</p>
            <p>color [option] [color]</p>
            <br />
            <p className="font-bold text-terminal">Options:</p>
            <span className="text-terminal">set</span> - Set the color of the website. Example: <span className="text-terminal">color set #22c55e</span>
            <br />
            <span className="text-terminal">get</span> - Get the current color of the website.
            <br />
            <span className="text-terminal">reset</span> - Reset the color to the default value.
            <br />
            <p className="font-bold text-terminal">Default Color:</p>
            <p className="text-terminal">#22c55e</p>
            <br />
            <p className="font-bold text-terminal">Description:</p>
            <p>Set or get the color of the website</p>
        </>
    ),
    args: [],
    run: async (args: string[], context: KeyPressContextType) => {
        if (args && args.length > 0) {
                if (args[0] === "set" && args[1] != null) {
                        if (!isValidHexColor(args[1])) {
                                return (
                                        <p className="text-red-500">Invalid hex color code. Please use format #RGB or #RRGGBB</p>
                                );
                        }
                        document.documentElement.style.setProperty('--terminal', args[1]);
                        return (
                                <p>
                                        <span>Setting color to </span>
                                        <span style={{ color: args[1] }}>
                                                {args[1]}
                                        </span>
                                </p>
                        );
                } else if (args[0] === "get") {
                        const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim();
                        return (
                                <p>
                                        <span>Current color is </span>
                                        <span style={{ color: currentColor }}>
                                                {currentColor}
                                        </span>
                                </p>
                        );
                } else if (args[0] === "reset") {
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
                );
        } else {
                return (
                        <p className="text-red-500">Usage: color (set #color/get)</p>
                );
        }
    }
};

