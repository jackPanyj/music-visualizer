"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { useMobile } from "@/hooks/useMobile";
import UI, { PresetTrack } from "@/components/UI";
import { THEMES, MODES } from "@/lib/themes";
import MatrixRain from "@/components/MatrixRain";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

const PRESETS: PresetTrack[] = [
  { name: "虹 / 菅田将暉 (covered by さとみりょめい)", url: "/music/niji.mp3" },
  {
    name: "恋に落ちて / 小林明子 (covered by 里見呂明)",
    url: "/music/fall-in-love.mp3",
  },
  {
    name: "桜 / 河口恭吾 (covered by 西光寺住職)",
    url: "/music/sakura.mp3",
  },
  {
    name: "いのちの歌 / 竹内まりや (僧侶ver.)",
    url: "/music/inochi-no-uta.mp3",
  },
];

// --- Mode Selector (top-right dropdown) ---
function ModeSelector({
  accent,
  currentMode,
  onModeChange,
  isMobile,
}: {
  accent: string;
  currentMode: (typeof MODES)[number];
  onModeChange: (mode: (typeof MODES)[number]) => void;
  isMobile: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: isMobile ? "12px 12px" : "8px 14px",
          borderRadius: 10,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${open ? accent + "44" : "rgba(255,255,255,0.08)"}`,
          color: "rgba(255,255,255,0.7)",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s ease",
          letterSpacing: 0.3,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12h4M18 12h4M8 5l4 4 4-4M8 19l4-4 4 4" />
        </svg>
        {currentMode.name}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 160,
            borderRadius: 12,
            background: "rgba(10,10,20,0.85)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            padding: 4,
            animation: "fadeIn 0.15s ease",
          }}
        >
          {MODES.map((m) => {
            const active = m.id === currentMode.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onModeChange(m);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: isMobile ? "11px 12px" : "9px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: active ? `${accent}18` : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", gap: 3 }}>
                  {(
                    ["sphere", "bars", "particles", "waveform"] as const
                  ).map((key) => (
                    <div
                      key={key}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: m[key]
                          ? accent
                          : "rgba(255,255,255,0.1)",
                        transition: "background 0.2s ease",
                      }}
                    />
                  ))}
                </div>
                {m.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Mobile mini now-playing bar ---
function MiniPlayer({
  fileName,
  accent,
  waveColor,
  onMenuOpen,
}: {
  fileName: string;
  accent: string;
  waveColor: string;
  onMenuOpen: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: "0 10px",
        paddingBottom: "max(10px, env(safe-area-inset-bottom, 10px))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          borderRadius: 16,
          background: "rgba(10,10,20,0.85)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Animated bars */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
            height: 14,
            flexShrink: 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 3,
                borderRadius: 1.5,
                background: `linear-gradient(to top, ${accent}, ${waveColor})`,
                animation: `barPulse 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Track name */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fileName}
        </div>

        {/* Open sidebar — 44px touch target */}
        <button
          onClick={onMenuOpen}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// --- Hamburger button (mobile, when not playing) ---
function MenuButton({
  accent,
  onClick,
}: {
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: 10,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
        border: `1px solid rgba(255,255,255,0.08)`,
        color: "rgba(255,255,255,0.7)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.2s ease",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

// --- Main Page ---
export default function Home() {
  const {
    isPlaying,
    fileName,
    loadFile,
    loadUrl,
    stop,
    getFrequencyData,
    getTimeData,
  } = useAudioAnalyzer();

  const isMobile = useMobile();
  const [theme, setTheme] = useState(THEMES[0]);
  const [mode, setMode] = useState(MODES[0]);
  const [matrixOn, setMatrixOn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    if (hasAutoPlayed.current) return;

    const handleInteraction = () => {
      if (hasAutoPlayed.current) return;
      hasAutoPlayed.current = true;
      loadUrl(PRESETS[0].url, PRESETS[0].name);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [loadUrl]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("audio/")) {
        loadFile(file);
      }
    },
    [loadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Sidebar: always rendered on desktop, overlay on mobile */}
      {!isMobile && (
        <UI
          isPlaying={isPlaying}
          fileName={fileName}
          presets={PRESETS}
          themes={THEMES}
          currentTheme={theme}
          onFileLoad={loadFile}
          onPresetSelect={loadUrl}
          onStop={stop}
          onThemeChange={setTheme}
          isMobile={false}
          sidebarOpen={true}
          onCloseSidebar={() => {}}
        />
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && (
        <UI
          isPlaying={isPlaying}
          fileName={fileName}
          presets={PRESETS}
          themes={THEMES}
          currentTheme={theme}
          onFileLoad={loadFile}
          onPresetSelect={loadUrl}
          onStop={stop}
          onThemeChange={setTheme}
          isMobile={true}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      )}

      {/* Canvas area */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        {/* Mobile: hamburger or mini player */}
        {isMobile && !sidebarOpen && (
          <>
            {isPlaying && fileName ? (
              <MiniPlayer
                fileName={fileName}
                accent={theme.accent}
                waveColor={theme.waveColor}
                onMenuOpen={() => setSidebarOpen(true)}
              />
            ) : (
              <MenuButton
                accent={theme.accent}
                onClick={() => setSidebarOpen(true)}
              />
            )}
          </>
        )}

        {/* Top-right controls */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? 12 : 16,
            right: isMobile ? 12 : 16,
            zIndex: 20,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-end" : "center",
            gap: 8,
          }}
        >
          {/* Matrix rain toggle */}
          <button
            onClick={() => setMatrixOn((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: isMobile ? "0" : "8px 10px",
              width: isMobile ? 40 : "auto",
              height: isMobile ? 40 : "auto",
              justifyContent: "center",
              borderRadius: 10,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${matrixOn ? theme.accent + "44" : "rgba(255,255,255,0.08)"}`,
              color: matrixOn ? theme.accent : "rgba(255,255,255,0.45)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.25s ease",
              letterSpacing: 0.3,
            }}
            title="Toggle Matrix Rain"
          >
            {/* Terminal icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            {/* Switch track — desktop only */}
            {!isMobile && (
              <div
                style={{
                  width: 28,
                  height: 16,
                  borderRadius: 8,
                  background: matrixOn ? theme.accent + "44" : "rgba(255,255,255,0.1)",
                  position: "relative",
                  transition: "background 0.25s ease",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: matrixOn ? theme.accent : "rgba(255,255,255,0.35)",
                    position: "absolute",
                    top: 2,
                    left: matrixOn ? 14 : 2,
                    transition: "all 0.25s ease",
                    boxShadow: matrixOn ? `0 0 6px ${theme.accent}` : "none",
                  }}
                />
              </div>
            )}
          </button>

          {/* Mode selector */}
          <ModeSelector
            accent={theme.accent}
            currentMode={mode}
            onModeChange={setMode}
            isMobile={isMobile}
          />
        </div>

        {/* Click to start hint */}
        {!isPlaying && !hasAutoPlayed.current && (
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 300,
                letterSpacing: isMobile ? 2 : 4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                animation: "subtleGlow 3s ease-in-out infinite",
              }}
            >
              {isMobile ? "Tap to start" : "Click anywhere to start"}
            </div>
            <div
              style={{
                marginTop: 12,
                width: 40,
                height: 1,
                margin: "12px auto 0",
                background: `linear-gradient(90deg, transparent, ${theme.accent}88, transparent)`,
              }}
            />
          </div>
        )}

        {/* Matrix rain overlay */}
        {matrixOn && (
          <MatrixRain
            color={theme.accent}
            getFrequencyData={getFrequencyData}
            isPlaying={isPlaying}
          />
        )}

        <Scene
          getFrequencyData={getFrequencyData}
          getTimeData={getTimeData}
          isPlaying={isPlaying}
          theme={theme}
          mode={mode}
          matrixOn={matrixOn}
        />
      </div>
    </div>
  );
}
