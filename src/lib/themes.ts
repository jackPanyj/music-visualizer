export interface VisualTheme {
  id: string;
  name: string;
  // Scene
  fog: string;
  lights: [color: string, position: [number, number, number], intensity: number][];
  bloom: { intensity: number; threshold: number; smoothing: number };
  // Sphere shader colors (vec3 RGB 0-1)
  sphere: { color1: [number, number, number]; color2: [number, number, number]; color3: [number, number, number] };
  // Bars
  barHueOffset: number; // added to base hue
  barSaturation: number;
  // Particles
  particleSaturation: number;
  particleLightness: number;
  // Waveform
  waveColor: string;
  waveOpacity: number;
  // UI accent
  accent: string;
  accentGlow: string;
}

export const THEMES: VisualTheme[] = [
  {
    id: "neon-purple",
    name: "Neon Purple",
    fog: "#000",
    lights: [
      ["#8844ff", [5, 5, 5], 1],
      ["#ff4488", [-5, -3, -5], 0.8],
      ["#00ffff", [0, 8, 0], 0.5],
    ],
    bloom: { intensity: 1.5, threshold: 0.2, smoothing: 0.9 },
    sphere: { color1: [0.1, 0.0, 0.8], color2: [0.8, 0.0, 0.5], color3: [0.0, 0.9, 1.0] },
    barHueOffset: 0,
    barSaturation: 1,
    particleSaturation: 0.8,
    particleLightness: 0.6,
    waveColor: "#00ffff",
    waveOpacity: 0.6,
    accent: "#8844ff",
    accentGlow: "rgba(136,68,255,0.3)",
  },
  {
    id: "cyber-ocean",
    name: "Cyber Ocean",
    fog: "#000510",
    lights: [
      ["#0088ff", [5, 5, 5], 1],
      ["#00ffcc", [-5, -3, -5], 0.8],
      ["#4466ff", [0, 8, 0], 0.5],
    ],
    bloom: { intensity: 1.8, threshold: 0.15, smoothing: 0.85 },
    sphere: { color1: [0.0, 0.1, 0.6], color2: [0.0, 0.6, 0.8], color3: [0.2, 0.9, 0.7] },
    barHueOffset: 0.5,
    barSaturation: 0.9,
    particleSaturation: 0.7,
    particleLightness: 0.55,
    waveColor: "#00ffcc",
    waveOpacity: 0.5,
    accent: "#0088ff",
    accentGlow: "rgba(0,136,255,0.3)",
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    fog: "#050000",
    lights: [
      ["#ff6600", [5, 5, 5], 1.2],
      ["#ff2200", [-5, -3, -5], 0.8],
      ["#ffcc00", [0, 8, 0], 0.6],
    ],
    bloom: { intensity: 2.0, threshold: 0.15, smoothing: 0.8 },
    sphere: { color1: [0.8, 0.1, 0.0], color2: [1.0, 0.5, 0.0], color3: [1.0, 0.9, 0.2] },
    barHueOffset: 0.05,
    barSaturation: 1,
    particleSaturation: 0.9,
    particleLightness: 0.5,
    waveColor: "#ff8800",
    waveOpacity: 0.5,
    accent: "#ff6600",
    accentGlow: "rgba(255,102,0,0.3)",
  },
  {
    id: "matrix",
    name: "Matrix",
    fog: "#000500",
    lights: [
      ["#00ff44", [5, 5, 5], 0.9],
      ["#00cc33", [-5, -3, -5], 0.6],
      ["#44ff88", [0, 8, 0], 0.4],
    ],
    bloom: { intensity: 1.6, threshold: 0.2, smoothing: 0.9 },
    sphere: { color1: [0.0, 0.3, 0.05], color2: [0.0, 0.8, 0.2], color3: [0.3, 1.0, 0.5] },
    barHueOffset: 0.33,
    barSaturation: 0.85,
    particleSaturation: 0.6,
    particleLightness: 0.5,
    waveColor: "#00ff44",
    waveOpacity: 0.7,
    accent: "#00cc44",
    accentGlow: "rgba(0,204,68,0.3)",
  },
  {
    id: "aurora",
    name: "Aurora",
    fog: "#000308",
    lights: [
      ["#22ccaa", [5, 5, 5], 0.9],
      ["#8855ff", [-5, -3, -5], 0.7],
      ["#00ff99", [0, 8, 0], 0.5],
    ],
    bloom: { intensity: 1.4, threshold: 0.2, smoothing: 0.9 },
    sphere: { color1: [0.0, 0.4, 0.3], color2: [0.3, 0.1, 0.7], color3: [0.1, 1.0, 0.6] },
    barHueOffset: 0.4,
    barSaturation: 0.75,
    particleSaturation: 0.7,
    particleLightness: 0.55,
    waveColor: "#44ffaa",
    waveOpacity: 0.5,
    accent: "#22ccaa",
    accentGlow: "rgba(34,204,170,0.3)",
  },
  {
    id: "sakura",
    name: "Sakura",
    fog: "#050005",
    lights: [
      ["#ff88aa", [5, 5, 5], 1],
      ["#ffaacc", [-5, -3, -5], 0.7],
      ["#dd66aa", [0, 8, 0], 0.5],
    ],
    bloom: { intensity: 1.3, threshold: 0.25, smoothing: 0.9 },
    sphere: { color1: [0.6, 0.1, 0.3], color2: [1.0, 0.5, 0.7], color3: [1.0, 0.8, 0.9] },
    barHueOffset: 0.9,
    barSaturation: 0.7,
    particleSaturation: 0.6,
    particleLightness: 0.65,
    waveColor: "#ff88bb",
    waveOpacity: 0.5,
    accent: "#ff6699",
    accentGlow: "rgba(255,102,153,0.3)",
  },
];

export interface VisualizerMode {
  id: string;
  name: string;
  sphere: boolean;
  bars: boolean;
  particles: boolean;
  waveform: boolean;
}

export const MODES: VisualizerMode[] = [
  { id: "all", name: "All", sphere: true, bars: true, particles: true, waveform: true },
  { id: "spectrum", name: "Spectrum", sphere: true, bars: true, particles: false, waveform: false },
  { id: "nebula", name: "Nebula", sphere: true, bars: false, particles: true, waveform: true },
  { id: "pulse", name: "Pulse", sphere: true, bars: false, particles: false, waveform: true },
  { id: "galaxy", name: "Galaxy", sphere: false, bars: false, particles: true, waveform: true },
  { id: "ring", name: "Ring", sphere: false, bars: true, particles: false, waveform: true },
];
