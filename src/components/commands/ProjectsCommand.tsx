import React, { useContext } from 'react';
import { KeyPressContext, KeyPressContextType } from "../../context/KeypressedContext";
import { Command } from './Command';
import { FaDartLang, FaFlutter, FaGithub } from 'react-icons/fa6';
import { SiOpenai } from 'react-icons/si';
import { FaRust } from 'react-icons/fa';

export const ProjectsCommand: Command = {
  name: "projects",  
  description: "List of my projects",
  args: ["--github", "--detail"],
  run: (args: string[], context: KeyPressContextType) => {
    if (args.length > 0) {
      console.log("args", args);
      switch (args[0]) {
        case "--detail":
          if (args[1] === "1") {
            return (
              <>
                <div className="flex items-center py-2 space-x-4">

                <h2 className="text-xl font-bold">Canvas App</h2>
                  <FaFlutter className="text-xl" />
                  <FaDartLang className="text-xl" />
                  <SiOpenai className="text-xl" />
                </div>
                <p className="text-terminal">A Canvas LMS client application built with Flutter.</p>
                <p>I created a wrapper for the university learning software. It allows the user to perform many different actions which aren't possible in the default app and allows the user to perform most tasks which are possible in the default app </p>
                <h4 className="mt-4 text-lg font-bold">Features</h4>
                <ul className="pl-6 list-disc">
                  <li>Calendar View</li>
                  <li>View/interact with your courses</li>
                  <li>View your assigments</li>
                  <li>Use AI to plan your assignments</li>
                  <li>Chat with your course material using AI</li>
                  <li>Create flashcards from your course material using AI</li>
                </ul>
              <button
                type="button"
                className="mt-4 text-gray-600 hover:underline"
                onClick={(e) => {
                  context?.setText(`projects --github ${args[1]}`);
                  // Prevent the button from being focused after click
                  (e.currentTarget as HTMLButtonElement).blur();
                }}>
                  <p>View on GitHub click this or type [projects --github {args[1]}]</p>
                </button>
                <br/>
              </>
            );
          } else if (args[1] === "2") {
            
            return (
              <>
                <div className="flex items-center py-2 space-x-4">
                  <h2 className="text-xl font-bold">Language Compiler</h2>
                  <FaRust className="text-xl" />
                </div>
                <p className="text-terminal">A compiler for a programming language</p>
                <p>I created a simple programming langauage in Rust to compile a basic langugae into assembly binary code</p>
                <h4 className="mt-4 text-lg font-bold">Features</h4>
                <ul className="pl-6 list-disc">
                  <li>Full function definitions and calls</li>
                  <li>Local variable declarations and assignments</li>
                  <li>Integer and string literals</li>
                  <li>While loops and if-else conditionals</li>
                  <li>Printing to stdout (print)</li>
                  <li>Expression evaluation with support for:</li>
                  <li>Arithmetic: +, -, *, /</li>
                  <li>{'Comparisons: ==, !=, <, >'}</li>
                </ul>
              <button
                type="button"
                className="mt-4 text-gray-600 hover:underline"
                onClick={(e) => {
                  context?.setText(`projects --github ${args[1]}`);
                  // Prevent the button from being focused after click
                  (e.currentTarget as HTMLButtonElement).blur();
                }}>
                  <p>View on GitHub click this or type [projects --github {args[1]}]</p>
                </button>
                <br />
              </>
            );
            
          } else {
            return (
              <span className="font-mono text-lg">
                No project number provided
                <br />
              </span>
            )
          }
        case "--github":
          if (args[1] === "1") {
            return (
              <>
                <a
                  href="https://github.com/TomasPalsson/canvas_app"
                  target="_blank"
                  className="inline-flex items-center p-2 space-x-2 text-terminal text-l hover:underline"
                  onClick={(e) => {
                    e.currentTarget.blur();
                  }}
                  >
                  <FaGithub />
                  <span>Github</span>
                </a>
                <br />
              </>
            );
          }
          else if (args[1] === "2") {
            return (
              <>
                <a
                  href="https://github.com/TomasPalsson/Language-Compiler"
                  target="_blank"
                  className="inline-flex items-center p-2 space-x-2 text-terminal text-l hover:underline"
                  onClick={(e) => {
                    e.currentTarget.blur();
                  }}
                  >
                    
                  <FaGithub />
                  <span>Github</span>
                </a>
                <br />
              </>
            );
          } else {
            return (
              <span className="font-mono text-lg">
                No project with that number found
                </span>
            );
          }
        default:
          context?.clearText();
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
  <div className="font-mono text-lg">
    <span className="text-gray-600">
      To see more detail do [projects --detail (project num)] or click on the project name below.
    </span>
    <div className="flex flex-col pt-2 pl-2">
      <button
        type="button"
        className="text-left text-terminal hover:underline"
        onClick={(e) => {
          context?.setText(`projects --detail 1`);
          // Prevent the button from being focused after click
          (e.currentTarget as HTMLButtonElement).blur();
        }}>
        1. Canvas App
      </button>
      <button
        type="button"
        className="text-left text-terminal hover:underline"
        onClick={(e) => {
          context?.setText(`projects --detail 1`);
          // Prevent the button from being focused after click
          (e.currentTarget as HTMLButtonElement).blur();
        }}>
        2. Language Compiler
      </button>
    </div>
  </div>
);

    }
    
  }
}

