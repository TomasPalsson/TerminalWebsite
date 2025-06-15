import React from "react";
import { KeyPressContextType } from "../../context/KeypressedContext";

export default interface Command {
  name: string;
  description: string;
  usage?: React.ReactNode;
  args: string[];
  run: (args: string[], context: KeyPressContextType) => Promise<React.ReactNode | null>;

}
