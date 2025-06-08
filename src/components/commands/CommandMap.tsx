import { ColorCommand } from "./ColorCommand";
import { Command } from "./Command"
import { CalcCommand } from "./CalcCommand";
import { CvCommand } from "./CvCommand";
import { EchoCommand } from "./EchoCommand";
import { ExitCommand } from "./ExitCommand";
import { HelpCommand } from "./HelpCommand";
import { IpCommand } from "./IpCommand";
import { ProjectsCommand } from "./ProjectsCommand";
import { SchoolCommand } from "./SchoolCommand";

export const commandMap = new Map<string, Command>();
commandMap.set(HelpCommand.name, HelpCommand);
commandMap.set(ProjectsCommand.name, ProjectsCommand);
commandMap.set(CvCommand.name, CvCommand);
commandMap.set(SchoolCommand.name, SchoolCommand);
commandMap.set(ExitCommand.name, ExitCommand);
commandMap.set(IpCommand.name, IpCommand);
commandMap.set(ColorCommand.name, ColorCommand);
commandMap.set(EchoCommand.name, EchoCommand);
commandMap.set(CalcCommand.name, CalcCommand);
