import React, { ReactNode, useContext, useEffect } from "react";
import { KeyPressContext } from "../context/KeypressedContext";
import { commandMap } from "./commands/CommandMap";
import Cursor from "./Cursor";

const TerminalHandler = () => {
  const context = useContext(KeyPressContext);

  const [output, setOutput] = React.useState<ReactNode[]>([]);

  if (!context) {
    throw new Error("Terminal Handler must be used within a KeyPressProvider");
  }

  const { text, clearText } = context;
  
  const bottomRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (text.endsWith("\n")) {

      const lines = text.split("\n");
      const cmd = lines[0].trim();
      const args = cmd.split(" ");
      const command = commandMap.get(args[0]);
      if (cmd === "clear") {
        setOutput([]);
        clearText();
      }

      else if (command) {
        const result = command.run(args.slice(1));
        const split = cmd.split(" ");

        if (command.name === "exit") {
          window.location.href = "/";
        }
        if (result) {
          setOutput((prev) => [
            ...prev,
            <span key={Math.random()} className="font-mono text-xl ">
              <span className="text-green-500 font-bold">{split[0]}</span>
              <span className="text-white">
                {split.length > 1 ? " " + split.slice(1).join(" ") : ""}
              </span>
              <br />
              {result}
            </span>,
          ]);
          clearText();
        }
      } else {
        setOutput((prev) => [
          ...prev,
          <span key={Math.random()} className="font-mono text-xl ">
            <span className="text-green-500 font-bold">{split[0]}</span>
            <span className="text-white">
              {split.length > 1 ? " " + split.slice(1).join(" ") : ""}
            </span>
            <span>Command not found:  
              <span className='text-red-600'>{" " + cmd}</span></span>
            <br />
            <span>Type 
              <span className='text-orange-500'> help </span>
              to see all available commands</span>
            <br />
          </span>,
        ]);
        clearText();
      }
    }
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

  }, [text]);

  const renderText = () => {
    if (text === "") return null;
    const split = text.split(" ");
    if (!split[0]) {
      return <span className="text-white">{text}</span>;
    }
    return (
      <>
        <span className="font-bold text-green-500">{split[0]}</span>
        <span className="text-white">
          {split.length > 1 ? " " + split.slice(1).join(" ") : ""}
        </span>
      </>
    );
  };

  const split = text.split(" ");
  const startString = '$ ';
  return (
    <>
      {output.map((line) => (
        <>
          <span className='font-mono text-xl text-terminal'>{startString}</span>
          <span key={Math.random()} className="font-mono text-xl whitespace-pre-wrap">
            {line}
          </span>
        </>
      ))}
      <span className='font-mono text-xl text-terminal'>{startString}</span>
      <span className="font-mono text-xl whitespace-pre-wrap">
        {renderText()}
      </span>
      <Cursor cursor="_" />
      <div ref={bottomRef} />
    </>
  );

};

export default TerminalHandler;
