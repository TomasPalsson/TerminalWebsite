import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo, useEffect, useState, useRef } from "react";
import * as THREE from "three";
import TerminalHandler from "../TerminalHandler";
import { KeyPressProvider } from "../../context/KeypressedContext";
import useKeyClick from "../../hooks/useKeyClick";
import { isMobile } from "react-device-detect";

/* ---------- hook that returns a CanvasTexture driven by terminal lines ---------- */
function useTerminalTexture(lines: string[]) {
    const { canvas, ctx, texture } = useMemo(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 768;
      const ctx = canvas.getContext("2d")!;
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = true;
      texture.wrapS = THREE.RepeatWrapping;
      texture.center.set(0.5, 0.5);
      return { canvas, ctx, texture };
    }, []);

    const visibleHeight = 768; // canvas height
    const margin = 20;
    const lineHeight = 42;
    const maxWidth = canvas.width - margin * 2;

    // Store cursor position for efficient blink updates
    const cursorPosRef = useRef<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: true });
    const cursorVisibleRef = useRef(true);
    const linesRef = useRef<string[]>([]);

    // Get terminal color once
    const color = useMemo(() => {
      const c = getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim() || "#0f0";
      return c === "#22c55e" ? "#0f0" : c;
    }, []);

    // Draw text content (only when lines change)
    useEffect(() => {
      linesRef.current = lines;

      // Clear the entire canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = "20px monospace";
      ctx.textBaseline = "top";

      // Calculate total height of all text
      let tempY = margin;
      lines.forEach((ln) => {
        const words = ln.split(" ");
        let line = "";
        words.forEach((word, idx) => {
          const test = line + (idx ? " " : "") + word;
          if (ctx.measureText(test).width > maxWidth) {
            tempY += lineHeight;
            line = word;
          } else {
            line = test;
          }
        });
        tempY += lineHeight;
      });
      const totalHeight = tempY;

      // Calculate starting y position
      let y = margin;
      if (totalHeight > visibleHeight) {
        y = margin - (totalHeight - visibleHeight);
      }

      // Draw visible portion of text
      lines.forEach((ln) => {
        const words = ln.split(" ");
        let line = "";
        words.forEach((word, idx) => {
          const test = line + (idx ? " " : "") + word;
          if (ctx.measureText(test).width > maxWidth) {
            if (y >= margin && y <= visibleHeight) {
              ctx.fillText(line, margin, y);
            }
            y += lineHeight;
            line = word;
          } else {
            line = test;
          }
        });
        if (y >= margin && y <= visibleHeight) {
          ctx.fillText(line, margin, y);
        }
        y += lineHeight;
      });

      // Store cursor position for blink effect
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        cursorPosRef.current = {
          x: margin + ctx.measureText(lastLine).width,
          y: y - lineHeight,
          visible: cursorVisibleRef.current
        };
        // Draw initial cursor
        if (cursorVisibleRef.current && cursorPosRef.current.y >= margin && cursorPosRef.current.y <= visibleHeight) {
          ctx.fillText("_", cursorPosRef.current.x, cursorPosRef.current.y);
        }
      }

      texture.needsUpdate = true;
    }, [lines, color, canvas, ctx, texture, maxWidth]);

    // Cursor blink effect - only redraws cursor area
    useEffect(() => {
      const cursorWidth = 15;
      const cursorHeight = lineHeight;

      const interval = setInterval(() => {
        cursorVisibleRef.current = !cursorVisibleRef.current;
        const pos = cursorPosRef.current;

        if (linesRef.current.length === 0 || pos.y < margin || pos.y > visibleHeight) return;

        // Clear just the cursor area
        ctx.fillStyle = "#000";
        ctx.fillRect(pos.x, pos.y, cursorWidth, cursorHeight);

        // Redraw cursor if visible
        if (cursorVisibleRef.current) {
          ctx.fillStyle = color;
          ctx.font = "20px monospace";
          ctx.textBaseline = "top";
          ctx.fillText("_", pos.x, pos.y);
        }

        texture.needsUpdate = true;
      }, 500);

      return () => clearInterval(interval);
    }, [color, canvas, ctx, texture]);

    return texture;
  }
  

/* ---------- GLTF wrapper ---------- */
function RetroComputer({ screenTexture }: { screenTexture: THREE.Texture }) {
  const { scene } = useGLTF("/scene.gltf");

  // slap material once model is ready
  useEffect(() => {
    const screen = scene.getObjectByName("PC_M_Screen_0") as THREE.Mesh;
    if (screen) {
      screen.material = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false });
    }
  }, [scene, screenTexture]);

  return <primitive object={scene} scale={[1.2, 1.2, 1.2]} />;
}

/* ---------- main component ---------- */
function TerminalScene() {
  const [buffer, setBuffer] = useState<string[]>([]);
  const screenTexture = useTerminalTexture(buffer);

  return (
    <>
      {/* headless terminal; just feeds `buffer` */}
      <TerminalHandler headless onBufferChange={setBuffer} />

      <Canvas className="fixed inset-0" camera={{ position: [0, 0.5, 1] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0.721, 0.9]} intensity={1} />
        <RetroComputer screenTexture={screenTexture} />
        <OrbitControls target={[0, 0.35, 0]} />
      </Canvas>
    </>
  );
}

export default function TerminalCanvas() {
  // Hooks must be called unconditionally
  const playClick = useKeyClick();

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="font-mono text-terminal">This is best viewed on desktop!</p>
      </div>
    );
  }

  return (
    <KeyPressProvider onKeyPress={playClick}>
      <div className="w-screen h-screen">
        <TerminalScene />
      </div>
    </KeyPressProvider>
  );
}
