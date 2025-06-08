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

    const totalHeightRef = useRef(0);
    const visibleHeight = 768; // canvas height
    const margin = 20;
    const lineHeight = 42;
    const maxWidth = canvas.width - margin * 2;
    const [cursorVisible, setCursorVisible] = useState(true);

    // Add cursor blink effect
    useEffect(() => {
      const interval = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }, []);
  
    /* helper → draw one string with word-wrap */
    const wrapText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;
      words.forEach((word, idx) => {
        const test = line + (idx ? " " : "") + word;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(line, x, currentY);
          currentY += lineHeight;
          line = word;
        } else {
          line = test;
        }
      });
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight; // next y-pos
    };
  
    let color = getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim() || "#0f0";
    useEffect(() => {
      // Clear the entire canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color == "#22c55e" ? "#0f0" : color;
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
      totalHeightRef.current = tempY;

      // Calculate starting y position
      let y = margin;
      if (totalHeightRef.current > visibleHeight) {
        y = margin - (totalHeightRef.current - visibleHeight);
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

      // Draw cursor if visible
      if (cursorVisible && lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        const cursorX = margin + ctx.measureText(lastLine).width;
        const cursorY = y - lineHeight;
        if (cursorY >= margin && cursorY <= visibleHeight) {
          ctx.fillText("_", cursorX, cursorY);
        }
      }
  
      texture.needsUpdate = true;
    }, [lines, cursorVisible]);
  
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
  if (!isMobile) {
  const playClick = useKeyClick();

  return (
    <KeyPressProvider onKeyPress={playClick}>
      <div className="w-screen h-screen">
        <TerminalScene />
      </div>
    </KeyPressProvider>
  );
}
else {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="font-mono text-terminal">This is best viewed on desktop!</p>
    </div>
  )
}
}
