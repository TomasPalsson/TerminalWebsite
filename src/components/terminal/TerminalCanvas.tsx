import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import TerminalHandler from "../TerminalHandler";
import { KeyPressProvider } from "../../context/KeypressedContext";

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
      words.forEach((word, idx) => {
        const test = line + (idx ? " " : "") + word;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(line, x, y);
          y += lineHeight;
          line = word;
        } else {
          line = test;
        }
      });
      ctx.fillText(line, x, y);
      return y + lineHeight; // next y-pos
    };
  
    useEffect(() => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "20px monospace";
      ctx.textBaseline = "top";
  
      const margin = 20;
      const maxWidth = canvas.width - margin * 2;
      const lineHeight = 42;
  
      let y = margin;
      lines.slice(-100).forEach((ln) => {
        y = wrapText(ln, margin, y, maxWidth, lineHeight);
      });
  
      texture.needsUpdate = true;
    }, [lines]);
  
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

      <Canvas className="fixed inset-0" camera={{ position: [0, 1.5, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0.721, 0.9]} intensity={1} />
        <RetroComputer screenTexture={screenTexture} />
        <OrbitControls target={[0, 0.35, 0]} />
      </Canvas>
    </>
  );
}

export default function TerminalCanvas() {
  return (
    <KeyPressProvider>
      <div className="w-screen h-screen">
        <TerminalScene />
      </div>
    </KeyPressProvider>
  );
}
