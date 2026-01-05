import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router";
import App from "../App";

// Lazy load all routes except home for better initial bundle size
const Terminal = lazy(() => import("../screens/Terminal").then(m => ({ default: m.Terminal })));
const AboutMe = lazy(() => import("../screens/AboutMe"));
const ChatMe = lazy(() => import("../screens/ChatMe"));
const IdeaGenerator = lazy(() => import("../screens/IdeaGenerator"));
const TerminalCanvas = lazy(() => import("./terminal/TerminalCanvas"));
const UrlShortener = lazy(() => import("../screens/UrlShortener"));
const IdeaLibrary = lazy(() => import("../screens/IdeaLibrary"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <span className="font-mono text-terminal animate-pulse">Loading...</span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
  )
}
