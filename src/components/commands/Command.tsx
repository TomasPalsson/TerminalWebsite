import { KeyPressContextType } from "../../context/KeypressedContext";

export interface Command {
  name: string;
  description: string;
  args: string[];
  run: (args: string, context: KeyPressContextType) => React.ReactNode | null;
}
