"use client";

import { useEffect, useRef } from "react";

// Katakana + digits + symbols, like the original Matrix
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|";

interface MatrixRainProps {
  color: string; // hex color, e.g. "#00ff44"
  getFrequencyData: () => Uint8Array | null;
  isPlaying: boolean;
}

export default function MatrixRain({
  color,
  getFrequencyData,
  isPlaying,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<Float32Array | null>(null);
  const speedsRef = useRef<Float32Array | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const fontSize = 14;
    const charArr = [...CHARS];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      const cols = Math.ceil(canvas!.offsetWidth / fontSize);
      const drops = new Float32Array(cols);
      const speeds = new Float32Array(cols);
      for (let i = 0; i < cols; i++) {
        drops[i] = Math.random() * -100; // stagger start
        speeds[i] = 0.3 + Math.random() * 0.7;
      }
      columnsRef.current = drops;
      speedsRef.current = speeds;
    }

    resize();
    window.addEventListener("resize", resize);

    // Parse hex color to rgb
    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    }

    let currentColor = hexToRgb(color);
    let targetColor = currentColor;

    function draw() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      const drops = columnsRef.current;
      const speeds = speedsRef.current;
      if (!drops || !speeds) return;

      // Smoothly transition color
      targetColor = hexToRgb(color);
      currentColor = {
        r: currentColor.r + (targetColor.r - currentColor.r) * 0.05,
        g: currentColor.g + (targetColor.g - currentColor.g) * 0.05,
        b: currentColor.b + (targetColor.b - currentColor.b) * 0.05,
      };
      const { r, g, b } = currentColor;

      // Get audio energy for brightness boost
      let energy = 0;
      if (isPlaying) {
        const freq = getFrequencyData();
        if (freq) {
          for (let i = 0; i < freq.length; i++) energy += freq[i];
          energy /= freq.length * 255;
        }
      }

      // Fade trail
      ctx.fillStyle = `rgba(0, 0, 0, ${0.04 + energy * 0.03})`;
      ctx.fillRect(0, 0, w, h);

      const cols = drops.length;

      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (y > 0 && y < h) {
          // Bright head character
          const headAlpha = 0.8 + energy * 0.2;
          ctx.fillStyle = `rgba(255, 255, 255, ${headAlpha})`;
          ctx.font = `${fontSize}px monospace`;
          const char = charArr[Math.floor(Math.random() * charArr.length)];
          ctx.fillText(char, x, y);

          // Trailing glow
          const trailAlpha = 0.3 + energy * 0.4;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailAlpha})`;
          const trailChar = charArr[Math.floor(Math.random() * charArr.length)];
          ctx.fillText(trailChar, x, y - fontSize);

          // Dimmer trail
          if (y - fontSize * 2 > 0) {
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + energy * 0.15})`;
            const dimChar = charArr[Math.floor(Math.random() * charArr.length)];
            ctx.fillText(dimChar, x, y - fontSize * 2);
          }
        }

        // Advance drop
        const speedBoost = 1 + energy * 2;
        drops[i] += speeds[i] * speedBoost;

        // Reset when off screen (with random delay)
        if (drops[i] * fontSize > h && Math.random() > 0.98) {
          drops[i] = Math.random() * -20;
          speeds[i] = 0.3 + Math.random() * 0.7;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [color, getFrequencyData, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.4,
      }}
    />
  );
}
