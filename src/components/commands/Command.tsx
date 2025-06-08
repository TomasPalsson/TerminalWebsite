import { KeyPressContextType } from "../../context/KeypressedContext";

export default interface Command {
  name: string;
  description: string;
  args: string[];
  run: (args: string, context: KeyPressContextType) => Promise<React.ReactNode | null>;
}
