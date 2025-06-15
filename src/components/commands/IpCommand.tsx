import React from "react";
import { Command } from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

export const IpCommand: Command = {
  name: "ip",
  description: "Get info about your ip :)",
  usage: (
    <>
      <p className="font-bold text-terminal">Usage:</p>
      <p>ip</p>
      <br />
      <p className="font-bold text-terminal">Description:</p>
      <p>Get info about your IP</p>
    </>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    let response = await fetch("https://api.tomasp.me/ip");
    let info = await response.json();
    return (
        <>
        <p><span className="text-terminal">IP:</span> {info.ip}</p>
        <p><span className="text-terminal">Location:</span> {info.city}, {info.region} {info.country_name}</p>
        <p><span className="text-terminal">ISP:</span> {info.asn.name} <a 
        href={`https://${info.asn.domain}`}
        className="underline"
        target="_blank"
        >{info.asn.domain}
        </a>
        </p>
        </>
    );
  }
};

