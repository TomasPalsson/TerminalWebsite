import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router";
import { FullScreenHandler } from "./components/FullScreenHandler.js";

document.documentElement.classList.add('bg-neutral-950', 'h-full');
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <FullScreenHandler />
  </BrowserRouter>
)
