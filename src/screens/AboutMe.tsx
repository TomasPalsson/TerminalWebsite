import React, { useState } from "react";
import { TerminalSquare, School, FolderGit2, Mail, Github, Smile } from "lucide-react";
import { FaGithub, FaRust } from "react-icons/fa";
import { SiAssemblyscript, SiOpenai } from "react-icons/si";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaArrowUpRightFromSquare, FaDartLang, FaFlutter } from "react-icons/fa6";
import { IoChatbubbleEllipsesOutline, IoDocument } from "react-icons/io5";
import { MainButton } from "../components/MainButton";
import { useNavigate } from "react-router";

export default function PersonalWebsiteTabs() {
  const [activeTab, setActiveTab] = useState("School");
  const navigate = useNavigate();

  const TABS = [
    {
      name: "School",
      icon: <School size={18} className="inline mr-2" />,
      content: (
        <>
          <h2 className="text-xl font-bold">Menntaskólinn við Hamrahlíð (2021-2023)</h2>
          <p className="text-gray-500">// International Baccalaureate</p>
          <a href="https://www.mh.is/is/ib-studies"
            target="_blank"
            className="inline-flex items-center p-2 mt-4 space-x-2 transition-colors duration-200 border rounded-l text-terminal border-terminal text-l hover:border-gray-600">
            <FaArrowUpRightFromSquare />
            <span>
              More Info
            </span>
          </a>
          <h2 className="pt-16 mt-4 text-xl font-bold">Háskólinn í Reykjavík (2023-2026)</h2>
          <p className="text-gray-500">// BSc in Software Engineering</p>
          <a href="https://www.ru.is/deildir/tolvunarfraedideild/hugbunadarverkfraedi-bsc"
            target="_blank"
            className="inline-flex items-center p-2 mt-4 space-x-2 transition-colors duration-200 border rounded-l text-terminal border-terminal text-l hover:border-gray-600">
            <FaArrowUpRightFromSquare />
            <span>
              More Info
            </span>
          </a>
        </>
      ),
    },
    {
      name: "Projects",
      icon: <FolderGit2 size={18} className="inline mr-2" />,
      content: (
        <>
          <h2 className="text-xl font-bold">Canvas App</h2>
          <div className="flex items-center py-2 space-x-4">
            <FaFlutter className="text-3xl" />
            <FaDartLang className="text-3xl" />
            <SiOpenai className="text-3xl" />
          </div>
          <p className="text-gray-500">// A Canvas LMS client application built with Flutter.</p>
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
          <br/>

          <a 
            href="https://github.com/TomasPalsson/canvas_app" 
            target="_blank"
            className="inline-flex items-center p-2 space-x-2 transition-colors duration-200 border rounded-l text-terminal border-terminal text-l hover:border-gray-600">
            <FaGithub />
            <span>Github</span>
          </a>

          <h2 className="mt-16 text-xl font-bold">Lanuage Compiler</h2>
          <div className="flex items-center py-2 space-x-4">
            <FaRust className="text-3xl" />
            <SiAssemblyscript className="text-3xl" />
          </div>
          <p className="text-gray-500">// A compiler for a programming language</p>
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
          <br/>
          
          <a 
            href="https://github.com/TomasPalsson/Language-Compiler" 
            target="_blank"
            className="inline-flex items-center p-2 space-x-2 transition-colors duration-200 border rounded-l text-terminal border-terminal text-l hover:border-gray-600">
            <FaGithub />
            <span>Github</span>
          </a>
        </>
      ),
    },
    {
      name: "Fun",
      icon: <Smile size={18} className="inline mr-2" />,
      content: (
        <div className="grid max-w-2xl grid-cols-2 gap-4 p-4 mx-auto">
          {/* 3D Terminal */}
          <button
            onClick={() => navigate("/blob")}
            className="flex items-center justify-center p-4 space-x-2 transition-colors duration-200 border rounded-lg text-terminal border-terminal hover:border-gray-600 hover:bg-terminal/5"
          >
            <TerminalSquare size={24} />
            <span className="text-lg">3D Terminal</span>
          </button>

          {/* Chat with me */}
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center justify-center p-4 space-x-2 transition-colors duration-200 border rounded-lg text-terminal border-terminal hover:border-gray-600 hover:bg-terminal/5"
          >
            <IoChatbubbleEllipsesOutline size={24} />
            <span className="text-lg">Chat With AI Me!</span>
          </button>

          {/* URL Shortener */}
          <button
            onClick={() => navigate("/shorten")}
            className="flex items-center justify-center p-4 space-x-2 transition-colors duration-200 border rounded-lg text-terminal border-terminal hover:border-gray-600 hover:bg-terminal/5"
          >
            <TerminalSquare size={24} />
            <span className="text-lg">URL Shortener</span>
          </button>

          {/* IDEA Generator */}
          <button
            onClick={() => navigate("/idea-generator")}
            className="flex items-center justify-center p-4 space-x-2 transition-colors duration-200 border rounded-lg text-terminal border-terminal hover:border-gray-600 hover:bg-terminal/5"
          >
            <IoMdInformationCircleOutline size={24} />
            <span className="text-lg">Idea Generator</span>
          </button>
        </div>
      ),
    },
    {
      name: "Contact",
      icon: <Mail size={18} className="inline mr-2" />,
      content: (
        <ul className="space-y-2">
          <li>
            <span className="font-semibold">Email:</span>{" "}
            <a
              href="mailto:tomas@p5.is"
              className="text-terminal hover:underline"
            >
              tomas@p5.is
            </a>
          </li>

          <li>
            <span className="font-semibold">GitHub:</span>{" "}
            <a
              href="https://t0mas.io/github"
              className="text-terminal hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://t0mas.io/github
              </a>
          </li>

          <li>
            <span className="font-semibold">Location:</span> Reykjavík, Iceland
          </li>
        </ul>
      ),
    },
  ];

  const currentTab = TABS.find((tab) => tab.name === activeTab);

  return (
    <div className="min-h-screen p-6 pt-16 font-mono text-terminal">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6 space-x-4">
          {TABS.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setActiveTab(name)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${activeTab === name
                  ? "border-terminal text-terminal"
                  : "border-transparent hover:border-gray-600"
                }`}
            >
              {icon}
              {name}
            </button>
          ))}
          <a
            href="https://api.tomasp.me/cv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 transition-colors duration-200 border border-transparent rounded-lg text-terminal hover:border-gray-600"
          >
            <IoDocument className="text-lg" />
            <span>CV</span>
          </a>
        </div>
        <div className="p-6 shadow-xl rounded-xl">
          {currentTab?.content}
        </div>
      </div>
    </div>
  );
}
