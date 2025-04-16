import React from "react";
import Command from "./Command";


export const CvCommand: Command = {
  name: "cv",
  description: "Get a Link to my CV",
  run: (args: string[]) => (
    <span className="font-mono text-xl ">
      <div className="flex flex-col">
        <span className='text-orange-500'>- CV 1</span>
        <span className='text-orange-500'>- CV 2</span>
        <span className='text-orange-500'>- CV 3</span>
      </div>
    </span>
  ),
};

