"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect } from "react";
import * as THREE from "three";
import Visualizer from "./Visualizer";
import type { VisualTheme, VisualizerMode } from "@/lib/themes";

interface SceneProps {
  getFrequencyData: () => Uint8Array | null;
  getTimeData: () => Uint8Array | null;
  isPlaying: boolean;
  theme: VisualTheme;
  mode: VisualizerMode;
  matrixOn: boolean;
  isMobile: boolean;
}

// Sync clear color + alpha with theme and matrixOn state
function ClearColor({ fog, matrixOn }: { fog: string; matrixOn: boolean }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor(new THREE.Color(fog), matrixOn ? 0.65 : 0.75);
  }, [gl, fog, matrixOn]);
  return null;
}

export default function Scene({
  getFrequencyData,
  getTimeData,
  isPlaying,
  theme,
  mode,
  matrixOn,
  isMobile,
}: SceneProps) {
  return (
    <Canvas
      camera={{
        position: isMobile ? [0, 22, 3] : [0, 5, 10],
        fov: isMobile ? 68 : 60,
      }}
      style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ClearColor fog={theme.fog} matrixOn={matrixOn} />
      <fog attach="fog" args={[theme.fog, isMobile ? 12 : 8, isMobile ? 32 : 25]} />

      <ambientLight intensity={0.3} />
      {theme.lights.map(([color, position, intensity], i) => (
        <pointLight key={i} color={color} position={position} intensity={intensity} />
      ))}

      <Visualizer
        getFrequencyData={getFrequencyData}
        getTimeData={getTimeData}
        isPlaying={isPlaying}
        theme={theme}
        mode={mode}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
      />

      <EffectComposer>
        <Bloom
          intensity={theme.bloom.intensity}
          luminanceThreshold={theme.bloom.threshold}
          luminanceSmoothing={theme.bloom.smoothing}
        />
      </EffectComposer>
    </Canvas>
  );
}
