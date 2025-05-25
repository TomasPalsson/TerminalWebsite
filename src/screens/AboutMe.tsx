import React, { useState } from "react";
import { TerminalSquare, School, FolderGit2, Mail, Github } from "lucide-react";

const TABS = [
  {
    name: "About",
    icon: <TerminalSquare size={18} className="inline mr-2" />,
    content: (
      <>
        <p className="text-xl font-bold">About Me</p>
        <span className="text-gray-500">// Testing</span>
      </>
    ),
  },
  {
    name: "School",
    icon: <School size={18} className="inline mr-2" />,
    content: (
      <>
        <h2 className="text-xl font-bold">Menntaskólinn við Hamrahlíð (2021-2023)</h2>
          <br/>
        <h2 className="text-xl font-bold mt-4">Háskólinn í Reykjavík (2023-2026)</h2>
        <p className="text-gray-500">// BSc in Computer Science</p>
      </>
    ),
  },
  {
    name: "Projects",
    icon: <FolderGit2 size={18} className="inline mr-2" />,
    content: (
      <>
        <h2 className="text-xl font-bold">Lanuage Compiler</h2>
        <p className="text-gray-500">// A compiler for a turing complete programming language</p>
        <p>I created a compiler for a turing complete programming language that used Rust</p>
        <p>to compile a basic langugae into assembly binary code</p>
        <br/>
        
        <a 
          href="https://github.com/TomasPalsson/Language-Compiler" 
          target="_blank"
          className="text-terminal border border-terminal border rounded-l text-l inline-flex items-center space-x-2 p-2 hover:border-gray-600  transition-colors duration-200">
          <Github />
          <span>Github</span>
        </a>

      </>
    ),
  },
  {
    name: "Contact",
    icon: <Mail size={18} className="inline mr-2" />,
    content: <p>Hello!</p>,
  },
];

export default function PersonalWebsiteTabs() {
  const [activeTab, setActiveTab] = useState("About");
  const currentTab = TABS.find((tab) => tab.name === activeTab);

  return (
    <div className="min-h-screen text-terminal font-mono p-6 pt-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6 space-x-4">
          {TABS.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setActiveTab(name)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                activeTab === name
                  ? "border-terminal text-terminal"
                  : "border-transparent hover:border-gray-600"
              }`}
            >
              {icon}
              {name}
            </button>
          ))}
        </div>
        <div className="rounded-xl shadow-xl p-6">
          {currentTab?.content}
        </div>
      </div>
    </div>
  );
}
