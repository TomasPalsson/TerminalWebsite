import { AliasCommand } from "./AliasCommand";
import { ColorCommand } from "./ColorCommand";
import { ExportCommand, UnsetCommand } from "./ExportCommand";
import Command from "./Command"
import { CalcCommand } from "./CalcCommand";
import { CvCommand } from "./CvCommand";
import { EchoCommand } from "./EchoCommand";
import { ExitCommand } from "./ExitCommand";
import { HelpCommand } from "./HelpCommand";
import { IpCommand } from "./IpCommand";
import { ProjectsCommand } from "./ProjectsCommand";
import { SchoolCommand } from "./SchoolCommand";
import { CurlCommand } from "./CurlCommand";
import { WeatherCommand } from "./WeatherCommand";
import { ShortenCommand } from "./ShortenCommand";
// Filesystem commands
import { PwdCommand } from "./fs/PwdCommand";
import { CdCommand } from "./fs/CdCommand";
import { LsCommand } from "./fs/LsCommand";
import { TouchCommand } from "./fs/TouchCommand";
import { CatCommand } from "./fs/CatCommand";
import { MkdirCommand } from "./fs/MkdirCommand";
import { RmCommand, RmdirCommand } from "./fs/RmCommand";
import { CpCommand } from "./fs/CpCommand";
import { MvCommand } from "./fs/MvCommand";
import { ClearFsCommand } from "./fs/ClearFsCommand";
import { FindCommand } from "./fs/FindCommand";
import { GrepCommand } from "./fs/GrepCommand";
// Git commands
import { GitCommand } from "./git/GitCommand";
// Vim editor
import { VimCommand } from "./vim/VimCommand";

export const commandMap = new Map<string, Command>();
commandMap.set(AliasCommand.name, AliasCommand);
commandMap.set(ExportCommand.name, ExportCommand);
commandMap.set(UnsetCommand.name, UnsetCommand);
commandMap.set(HelpCommand.name, HelpCommand);
commandMap.set(ProjectsCommand.name, ProjectsCommand);
commandMap.set(CvCommand.name, CvCommand);
commandMap.set(SchoolCommand.name, SchoolCommand);
commandMap.set(ExitCommand.name, ExitCommand);
commandMap.set(IpCommand.name, IpCommand);
commandMap.set(ColorCommand.name, ColorCommand);
commandMap.set(EchoCommand.name, EchoCommand);
commandMap.set(CalcCommand.name, CalcCommand);
commandMap.set(CurlCommand.name, CurlCommand);
commandMap.set(WeatherCommand.name, WeatherCommand);
commandMap.set(ShortenCommand.name, ShortenCommand);
// Filesystem commands
commandMap.set(PwdCommand.name, PwdCommand);
commandMap.set(CdCommand.name, CdCommand);
commandMap.set(LsCommand.name, LsCommand);
commandMap.set(TouchCommand.name, TouchCommand);
commandMap.set(CatCommand.name, CatCommand);
commandMap.set(MkdirCommand.name, MkdirCommand);
commandMap.set(RmCommand.name, RmCommand);
commandMap.set(RmdirCommand.name, RmdirCommand);
commandMap.set(CpCommand.name, CpCommand);
commandMap.set(MvCommand.name, MvCommand);
commandMap.set(ClearFsCommand.name, ClearFsCommand);
commandMap.set(FindCommand.name, FindCommand);
commandMap.set(GrepCommand.name, GrepCommand);
// Git commands
commandMap.set(GitCommand.name, GitCommand);
// Vim editor
commandMap.set(VimCommand.name, VimCommand);
