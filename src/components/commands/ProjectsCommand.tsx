import React from 'react';
import { Command } from './Command';

export const ProjectsCommand: Command = { 
  name: "projects",  
  description: "List of my projects",
  args: ["--github", "--detail"],
  run: (args: string[]) => {
    if (args.length > 0) {
      console.log("args", args);
      switch (args[0]) {
        case "--detail":
          if (args[1] === "1") {
            return (
              <span className="font-mono text-xl ">
                <div className="flex flex-col">
                  <span>More Info on Project 1</span>
                </div>
              </span>
            );
          } else {
            return (
              <span className="font-mono text-xl ">
                No project number provided
                <br />
              </span>
            )
          }
        default:
          return (
            <span>
              Invalid Arguments <span className='text-red-500'>{args.join(", ")}</span>
              <br />
            </span>
          )
      }
    }
    else {
    return (
      <span className="font-mono text-xl ">
        <div className="flex flex-col">
          <span className='text-orange-500'>- Project 1</span>
          <span className='text-orange-500'>- Project 2</span>
          <span className='text-orange-500'>- Project 3</span>
        </div>
      </span>
      );
    }
    
  }
}

