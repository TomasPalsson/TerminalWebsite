import React from "react";
import Command from "./Command";


export const CvCommand: Command = {
  name: "cv",
  description: "Get a Link to my CV",
  run: (args: string[]) => (
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
  ),
};

