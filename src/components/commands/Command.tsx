export interface Command {
  name: string;
  description: string;
  args: string[];
  run: (args: string) => React.ReactNode | null;
}
