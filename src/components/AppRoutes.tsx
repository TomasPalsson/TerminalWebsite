import React from "react";
import { Routes, Route } from "react-router";
import App from "../App";
import { Terminal } from "../screens/Terminal";
import AboutMe from "../screens/AboutMe";
import ChatMe from "../screens/ChatMe";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/terminal" element={<Terminal />} />
      <Route path="/chat" element={<ChatMe />} />

      <Route path="/aboutme" element={<AboutMe />} />
    </Routes>
  )
}
