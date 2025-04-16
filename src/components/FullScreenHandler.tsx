import React, { useRef } from "react";
import MacBar from "./MacBar";
import AppRoutes from "./AppRoutes";

export function FullScreenHandler() {
  const fullscreenRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={fullscreenRef}>
      <MacBar fullscreenRef={fullscreenRef} />
      <div className="pt-10">
        <AppRoutes />
      </div>
    </div>
  );
}
