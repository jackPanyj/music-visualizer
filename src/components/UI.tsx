"use client";

import { useCallback, useRef, useState } from "react";
import type { VisualTheme } from "@/lib/themes";

export interface PresetTrack {
  name: string;
  url: string;
}

interface UIProps {
  isPlaying: boolean;
  fileName: string | null;
  presets: PresetTrack[];
  themes: VisualTheme[];
  currentTheme: VisualTheme;
  onFileLoad: (file: File) => void;
  onPresetSelect: (url: string, name: string) => void;
  onStop: () => void;
  onThemeChange: (theme: VisualTheme) => void;
  // Mobile
  isMobile: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}

function ThemeDots({ theme }: { theme: VisualTheme }) {
  const colors = theme.lights.map(([c]) => c);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {colors.map((c, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: c,
            boxShadow: `0 0 6px ${c}`,
          }}
        />
      ))}
    </div>
  );
}

export default function UI({
  isPlaying,
  fileName,
  presets,
  themes,
  currentTheme,
  onFileLoad,
  onPresetSelect,
  onStop,
  onThemeChange,
  isMobile,
  sidebarOpen,
  onCloseSidebar,
}: UIProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [uploadHover, setUploadHover] = useState(false);
  const [stopHover, setStopHover] = useState(false);

  const accent = currentTheme.accent;
  const accentGlow = currentTheme.accentGlow;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileLoad(file);
    },
    [onFileLoad]
  );

  const handlePresetClick = useCallback(
    (url: string, name: string) => {
      onPresetSelect(url, name);
      if (isMobile) onCloseSidebar();
    },
    [onPresetSelect, isMobile, onCloseSidebar]
  );

  // On mobile, don't render if closed (but keep backdrop transition)
  if (isMobile && !sidebarOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          onClick={onCloseSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      <div
        style={{
          width: isMobile ? "85vw" : 300,
          maxWidth: isMobile ? 340 : 300,
          minWidth: isMobile ? 0 : 300,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, rgba(15,10,30,0.95) 0%, rgba(5,5,15,0.98) 100%)",
          backdropFilter: "blur(40px) saturate(1.2)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          boxShadow: isMobile
            ? "4px 0 40px rgba(0,0,0,0.8)"
            : "inset -1px 0 0 rgba(255,255,255,0.03), 4px 0 30px rgba(0,0,0,0.5)",
          zIndex: isMobile ? 50 : 10,
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          animation: isMobile ? "slideIn 0.25s ease" : undefined,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent}33, transparent)`,
            zIndex: 1,
            transition: "background 0.5s ease",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: isMobile ? "20px 20px 18px" : "32px 24px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -5,
                left: -5,
                width: 120,
                height: 40,
                background: `radial-gradient(ellipse, ${accent}22, transparent)`,
                filter: "blur(20px)",
                pointerEvents: "none",
                transition: "background 0.5s ease",
              }}
            />
            <h1
              style={{
                fontSize: isMobile ? 18 : 20,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                letterSpacing: -0.3,
                position: "relative",
              }}
            >
              Music Visualizer
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                margin: "6px 0 0",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 500,
                position: "relative",
              }}
            >
              3D Audio Reactive
            </p>
          </div>

          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={onCloseSidebar}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Now playing */}
        {isPlaying && (
          <div
            style={{
              padding: isMobile ? "14px 20px" : "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
              background: `linear-gradient(90deg, ${accent}0a, transparent)`,
              transition: "background 0.5s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                height: 16,
                flexShrink: 0,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    borderRadius: 1.5,
                    background: `linear-gradient(to top, ${accent}, ${currentTheme.waveColor})`,
                    animation: `barPulse 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                    transition: "background 0.5s ease",
                  }}
                />
              ))}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: accent,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginBottom: 4,
                  opacity: 0.9,
                  transition: "color 0.5s ease",
                }}
              >
                Now Playing
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                }}
              >
                {fileName}
              </div>
            </div>
            <button
              onClick={onStop}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: stopHover ? "rgba(255,68,102,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${stopHover ? "rgba(255,68,102,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: stopHover ? "#ff4466" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={() => setStopHover(true)}
              onMouseLeave={() => setStopHover(false)}
              title="Stop"
            >
              ■
            </button>
          </div>
        )}

        {/* Theme selector */}
        <div
          style={{
            padding: "16px 12px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: 2,
              fontWeight: 600,
              padding: "0 14px 10px",
            }}
          >
            Theme
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              padding: "0 6px",
            }}
          >
            {themes.map((t) => {
              const active = t.id === currentTheme.id;
              const hovered = hoveredTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t)}
                  onMouseEnter={() => setHoveredTheme(t.id)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: active
                      ? `1px solid ${t.accent}44`
                      : "1px solid transparent",
                    background: active
                      ? `${t.accent}15`
                      : hovered
                        ? "rgba(255,255,255,0.04)"
                        : "transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    textAlign: "left",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name}
                  </span>
                  <ThemeDots theme={t} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Track list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 12px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: 2,
              fontWeight: 600,
              padding: "4px 14px 12px",
            }}
          >
            Playlist
          </div>
          {presets.map((track, idx) => {
            const active = fileName === track.name;
            const hovered = hoveredTrack === idx;
            return (
              <button
                key={track.url}
                onClick={() => handlePresetClick(track.url, track.name)}
                onMouseEnter={() => setHoveredTrack(idx)}
                onMouseLeave={() => setHoveredTrack(null)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: active
                    ? `linear-gradient(135deg, ${accent}18, ${currentTheme.waveColor}0a)`
                    : hovered
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  border: active
                    ? `1px solid ${accent}22`
                    : "1px solid transparent",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.25s ease",
                  transform: hovered && !active ? "translateX(2px)" : "none",
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: active
                      ? `linear-gradient(135deg, ${accent}, ${currentTheme.waveColor})`
                      : hovered
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.04)",
                    border: active
                      ? "none"
                      : `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    flexShrink: 0,
                    color: active ? "#fff" : "rgba(255,255,255,0.3)",
                    fontWeight: 600,
                    transition: "all 0.25s ease",
                    boxShadow: active
                      ? `0 2px 12px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.15)`
                      : "none",
                  }}
                >
                  {active && isPlaying ? "▶" : idx + 1}
                </span>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: active ? 500 : 400,
                    letterSpacing: -0.1,
                  }}
                >
                  {track.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Upload */}
        <div
          style={{
            padding: isMobile ? "16px 16px 24px" : "16px 16px 28px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            onMouseEnter={() => setUploadHover(true)}
            onMouseLeave={() => setUploadHover(false)}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${accent}, ${currentTheme.waveColor})`,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "13px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: 0.3,
              transition: "all 0.3s ease",
              transform: uploadHover ? "translateY(-1px)" : "none",
              boxShadow: uploadHover
                ? `0 4px 20px ${accentGlow}, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)`
                : `0 2px 10px ${accent}22, 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            + Upload Audio
          </button>
        </div>
      </div>
    </>
  );
}
