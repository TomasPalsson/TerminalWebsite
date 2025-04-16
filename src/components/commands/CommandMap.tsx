import { Command } from "./Command"
import { CvCommand } from "./CvCommand";
import { ExitCommand } from "./ExitCommand";
import { HelpCommand } from "./HelpCommand";
import { ProjectsCommand } from "./ProjectsCommand";
import { SchoolCommand } from "./SchoolCommand";

export const commandMap = new Map<string, Command>();
commandMap.set(HelpCommand.name, HelpCommand);
commandMap.set(ProjectsCommand.name, ProjectsCommand);
commandMap.set(CvCommand.name, CvCommand);
commandMap.set(SchoolCommand.name, SchoolCommand);
commandMap.set(ExitCommand.name, ExitCommand);

