import React from "react";
import { Command } from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

export const CurlCommand: Command = {
  name: "curl",
  description: "make HTTP requests",
  args: [],
  run: async (args: string, context: KeyPressContextType) => {
    if (!args) {
      return (
        <p className="text-red-500">
          Usage: curl [URL] [-I]<br/>
          Example: curl https://api.example.com<br/>
        </p>
      );
    }

    const argsArray = args.split(" ");
    const fetchHeadersOnly = argsArray.includes("-I");
    const url = fetchHeadersOnly ? argsArray.find(arg => arg !== "-I") : argsArray[0];

    if (!url || !url.startsWith("http")) {
      return (
        <p className="text-red-500">
          Invalid usage. Please provide a valid URL.<br/>
        </p>
      );
    }

    try {
      const response = await fetch(url);

      if (fetchHeadersOnly) {
        const headers = Array.from(response.headers.entries())
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");

        return (
          <pre className="whitespace-pre-wrap text-terminal">
            {headers}
          </pre>
        );
      }

      const data = await response.text();

      return (
        <pre className="whitespace-pre-wrap text-terminal">
          {data}
        </pre>
      );
    } catch (error) {
      return (
        <p className="text-red-500">
          Failed to fetch the URL. Please ensure it is valid and try again.
        </p>
      );
    }
  },
};
