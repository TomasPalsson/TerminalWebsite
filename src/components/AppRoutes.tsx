import React from "react";
import { Routes, Route } from "react-router";
import App from "../App";
import { Terminal } from "../screens/Terminal";
import AboutMe from "../screens/AboutMe";
import ChatMe from "../screens/ChatMe";
import IdeaGenerator from "../screens/IdeaGenerator";
import TerminalCanvas from "./terminal/TerminalCanvas";
import UrlShortener from "../screens/UrlShortener";
import IdeaLibrary from "../screens/IdeaLibrary";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/terminal" element={<Terminal />} />
      <Route path="/chat" element={<ChatMe />} />
      <Route path="/idea-generator" element={<IdeaGenerator />} />
      <Route path="/ideas" element={<IdeaLibrary />} />
      <Route path="/aboutme" element={<AboutMe />} />
      <Route path="/blob" element={<TerminalCanvas />} />
      <Route path="/shorten" element={<UrlShortener />} />
    </Routes>
  )
}
