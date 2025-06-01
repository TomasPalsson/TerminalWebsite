import React from "react";
import { Routes, Route } from "react-router";
import App from "../App";
import { Terminal } from "../screens/Terminal";
import AboutMe from "../screens/AboutMe";
import ChatMe from "../screens/ChatMe";
import IdeaGenerator from "../screens/IdeaGenerator";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/terminal" element={<Terminal />} />
      <Route path="/chat" element={<ChatMe />} />
      <Route path="/idea-generator" element={<IdeaGenerator />} />
      <Route path="/aboutme" element={<AboutMe />} />
    </Routes>
  )
}
