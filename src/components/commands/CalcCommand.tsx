import React from "react";
import { Command } from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

const calculate = (expression: string): number | null => {
  try {
    // Remove any whitespace
    const cleanExpr = expression.replace(/\s+/g, '');
    
    // Basic validation - only allow numbers and basic operators
    if (!/^[0-9+\-*/().]+$/.test(cleanExpr)) {
      return null;
    }
    
    // Use Function constructor to safely evaluate the expression
    // This is safer than eval() but still needs the validation above
    return new Function(`return ${cleanExpr}`)();
  } catch (error) {
    return null;
  }
};

export const CalcCommand: Command = {
  name: "calc",
  description: "perform basic arithmetic calculations",
  usage: (
    <>
      <p className="font-bold text-terminal">Usage:</p>
      <p>calc [expression]</p>
      <br />
      <p className="font-bold text-terminal">Description:</p>
      <p>Perform basic arithmetic calculations</p>
    </>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    if (!args) {
      return (
        <p className="text-red-500">
          Usage: calc [expression]<br/>
          Example: calc 2 + 2<br/>
          Supported operations: +, -, *, /, ( )
        </p>
      );
    }

    const result = calculate(args.join(" "));
    
    if (result === null) {
      return (
        <p className="text-red-500">
          Invalid expression. Please use only numbers and basic operators (+, -, *, /, ( ))
        </p>
      );
    }

    return (
      <p>
        <span className="text-terminal">{"> "}{result}</span>
      </p>
    );
  }
};