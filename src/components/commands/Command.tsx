import React from "react";
import { KeyPressContextType } from "../../context/KeypressedContext";

export default interface Command {
  name: string;
  description: string;
  usage?: React.ReactNode;
  args: string[];
  run: (args: string[], context: KeyPressContextType) => Promise<React.ReactNode | null>;
  /**
   * Optional compact plain-text rendering for the 3D CRT (~60 columns, 19 rows).
   * Return null to fall back to flattening the rich output.
   */
  plain?: (args: string[], context: KeyPressContextType) => string | null;
}
