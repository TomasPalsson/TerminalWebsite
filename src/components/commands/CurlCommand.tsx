import React from "react";
import Command from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

export const CurlCommand: Command = {
  name: "curl",
  description: "make HTTP requests",
  usage: (
    <p>
      Usage: <code className="text-terminal">curl [options] &lt;URL&gt;</code><br />
      Example: <code className="text-terminal">curl https://api.example.com</code><br />
      <span className="text-terminal">Options:</span><br />
      -I, --head Fetch headers only (HEAD request)<br />
      -i, --include Include headers *and* body<br />
    </p>
  ),
  args: [],
  run: async (args: string[], _ctx: KeyPressContextType) => {
    if (!args.length)
      return <p className="text-red-500">Usage: curl [options] &lt;URL&gt;</p>;

    const incHeaders = args.some(a => ["-i", "--include"].includes(a));
    const headOnly  = args.some(a => ["-I", "--head"].includes(a));

    const url = args.find(
      a => !["-i", "--include", "-I", "--head"].includes(a)
    );

    if (!url?.startsWith("http"))
      return <p className="text-red-500">Invalid URL.</p>;

    try {
      const res = await fetch(url, headOnly ? { method: "HEAD" } : {});
      const headerLines = [...res.headers.entries()]
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      if (headOnly)
        return <pre className="whitespace-pre-wrap text-terminal">{headerLines}</pre>;

      const body = await res.text();

      return (
        <pre className="whitespace-pre-wrap text-terminal">
          {incHeaders ? headerLines + "\n\n" : ""}
          {body || "[no body]"}
        </pre>
      );
    } catch {
      return <p className="text-red-500">Fetch failed – check the URL.</p>;
    }
  },
};
export default CurlCommand;