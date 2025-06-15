import React from "react";
import { Command } from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";


export const CvCommand: Command = {
  name: "cv",
  description: "Get a Link to my CV",
  usage: (
    <>
      <p className="font-bold text-terminal">Usage:</p>
      <p>cv</p>
      <br />
      <p className="font-bold text-terminal">Description:</p>
      <p>Get a Link to my CV</p>
    </>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    return (
      <>
        <a
          href="https://api.tomasp.me/cv"
          target="_blank"
          className="text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >
          Click here to view my CV
        </a>
        <br />
      </>
    );
  }
};

