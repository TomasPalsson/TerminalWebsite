import { KeyPressContextType } from "../../context/KeypressedContext";
import Command from './Command';
import { FaDartLang, FaFlutter, FaGithub } from 'react-icons/fa6';
import { FaRust, FaAws, FaReact, FaPython } from 'react-icons/fa';
import { TbBrandThreejs } from 'react-icons/tb';
import { SiOpenai } from 'react-icons/si';


export const ProjectsCommand: Command = {
  name: "projects",  
  description: "List of my projects",
  args: ["--github", "--detail"],
  usage: (
    <>
      <p className="font-bold text-terminal">Usage:</p>
      <p>projects [options] [project_number]</p>
      <br />
      <p className="font-bold text-terminal">Options:</p>
      <span className="text-terminal">-d, --detail</span> - Show project details<br />
      <span className="text-terminal">-g, --github</span> - Show project GitHub link<br />
      <br />
      <p className="font-bold text-terminal">Description:</p>
      <p>List of my projects with details and GitHub links</p>
    </>
  ),
  run: async (args: string[], context: KeyPressContextType) => {
    if (args.length > 0) {
      console.log("args", args);
      switch (args[0]) {
        case "--detail":
        case "-d":
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
                <p>I built a custom wrapper for the university's learning platform with AI-powered features. It lets users do everything the default app supports — plus extras like AI chat, smart flashcards, and task management that the official app doesn't offer.</p>
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
                <p>I created a simple programming langauage in Rust to compile a basic language into assembly binary code</p>
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
            
          } else if (args[1] === "3") {
            return (
              <>
                <div className="flex items-center py-2 space-x-4">
                  <h2 className="text-xl font-bold">Personal Website</h2>
                  <FaReact className="text-xl" />
                  <TbBrandThreejs className="text-xl" />
                  <FaPython className="text-xl" />
                  <FaAws className="text-xl" />
                </div>
                <p className="text-terminal">This website with a 3D terminal and tools.</p>
                <p>Includes a CV viewer, chat bot, URL shortener and idea generator. Hosted on AWS with a Lambda backend.</p>
                <h4 className="mt-4 text-lg font-bold">Features</h4>
                <ul className="pl-6 list-disc">
                  <li>3D terminal interface</li>
                  <li>View CV through commands</li>
                  <li>Chat with AI</li>
                  <li>URL shortener</li>
                  <li>Idea generator</li>
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
        case "-g":
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
          } else if (args[1] === "3") {
            return (
              <>
                <a
                  href="https://github.com/TomasPalsson/TerminalWebsite"
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
            context?.clearText();
            return (
              <span className="font-mono text-lg">
                No project with that number found
                </span>
            );
          }
        default:
          context?.clearText();
          return (
            <>
              <span>
                Invalid Arguments <span className='text-red-500'>{Array.isArray(args) ? args.join(", ") : String(args)}</span>
              </span>
              <br />
              <p className="font-bold text-terminal">Usage:</p>
              <p>projects [options] [project_number]</p>
              <br />
              <p className="font-bold text-terminal">Options:</p>
              <p>-d, --detail     Show project details</p>
              <p>-g, --github     Show project GitHub link</p>

            </>
          )
      }
    }
    else {
return (
  <div className="font-mono text-lg">
    <p className="text-gray-600">
      To see more detail do [projects -d (project num)] or click on the project name below.
    </p>
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
          context?.setText(`projects --detail 2`);
          // Prevent the button from being focused after click
          (e.currentTarget as HTMLButtonElement).blur();
        }}>
        2. Language Compiler
      </button>
      <button
        type="button"
        className="text-left text-terminal hover:underline"
        onClick={(e) => {
          context?.setText(`projects --detail 3`);
          // Prevent the button from being focused after click
          (e.currentTarget as HTMLButtonElement).blur();
        }}>
        3. Personal Website
      </button>
    </div>
  </div>
);

    }
    
  }
}

