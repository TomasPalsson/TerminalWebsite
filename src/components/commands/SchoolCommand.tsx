import React from "react"; 
import Command from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

export const SchoolCommand: Command = {
  name: "school",
  description: "A list of where I've studied",
  usage: (
    <p className="text-terminal">Usage: <span className="text-white">school</span></p>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => (
    <div className="font-mono text-xl text-gray-200 whitespace-pre">
{`▸ Menntaskólinn Við Hamrahlíð
    • `}<span className="italic text-purple-400">International Baccalaureate</span>{`
    • `}<span className="text-gray-400">Graduated May 2023</span>{`

▸ University of Reykjavik
    • `}<span className="italic text-purple-400">Software Engineering</span>{`
    • `}<span className="text-gray-400">Started September 2023</span>{`
    • `}<span className="text-gray-400">Expected Graduation May 2026</span>
    </div>
  ),
};
