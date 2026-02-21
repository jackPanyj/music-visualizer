# Music Visualizer

3D audio-reactive music visualizer built with Next.js and Three.js.

**Live Demo**: [music-visualizer-coral.vercel.app](https://music-visualizer-coral.vercel.app)

## Features

- **3D Visualizer** - Central pulse sphere, circular frequency bars, particle ring, waveform ring
- **6 Themes** - Neon Purple, Cyber Ocean, Solar Flare, Matrix, Aurora, Sakura
- **6 Modes** - All, Spectrum, Nebula, Pulse, Galaxy, Ring
- **Matrix Rain** - Toggleable falling-code background effect (audio-reactive)
- **Holographic Background** - Animated aurora overlay with screen blend
- **Mobile Responsive** - Optimized camera, touch-friendly controls, slide-over sidebar
- **Drag & Drop** - Drop any audio file to play

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **3D**: Three.js via @react-three/fiber, drei, postprocessing
- **Styling**: Tailwind CSS v4, glassmorphism UI
- **Audio**: Web Audio API (AnalyserNode)
- **Shaders**: Custom GLSL (simplex noise displacement, fresnel rim glow)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/           # Next.js app router (page, layout, globals.css)
  components/
    Scene.tsx      # Three.js canvas, camera, lighting, fog, bloom
    Visualizer.tsx # Sphere, bars, particles, waveform (GLSL shaders)
    MatrixRain.tsx # 2D canvas falling-code effect
    UI.tsx         # Sidebar: now playing, themes, playlist
  hooks/
    useAudioAnalyzer.ts  # Web Audio API wrapper
    useMobile.ts         # Responsive breakpoint hook
  lib/
    themes.ts    # Theme & mode definitions
public/
  music/         # Audio files
```
