"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { VisualTheme, VisualizerMode } from "@/lib/themes";

const BAR_COUNT = 128;
const RADIUS = 4;
const BAR_WIDTH = 0.08;

interface VisualizerProps {
  getFrequencyData: () => Uint8Array | null;
  getTimeData: () => Uint8Array | null;
  isPlaying: boolean;
  theme: VisualTheme;
  mode: VisualizerMode;
}

// Circular frequency bars
function FrequencyBars({ getFrequencyData, isPlaying, theme }: VisualizerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => new Float32Array(BAR_COUNT * 3), []);
  const smoothedRef = useRef(new Float32Array(BAR_COUNT));

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const freq = isPlaying ? getFrequencyData() : null;
    const t = clock.getElapsedTime();

    for (let i = 0; i < BAR_COUNT; i++) {
      const angle = (i / BAR_COUNT) * Math.PI * 2;
      const raw = freq ? freq[i] / 255 : 0;

      smoothedRef.current[i] += (raw - smoothedRef.current[i]) * 0.3;
      const val = smoothedRef.current[i];

      const barHeight = 0.1 + val * 4;
      const x = Math.cos(angle) * RADIUS;
      const z = Math.sin(angle) * RADIUS;

      dummy.position.set(x, barHeight / 2, z);
      dummy.scale.set(BAR_WIDTH, barHeight, BAR_WIDTH);
      dummy.lookAt(0, barHeight / 2, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const hue = (i / BAR_COUNT + theme.barHueOffset + t * 0.05) % 1;
      const lightness = 0.4 + val * 0.3;
      const color = new THREE.Color().setHSL(hue, theme.barSaturation, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BAR_COUNT]}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </boxGeometry>
      <meshPhongMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

// Central pulsing sphere
function PulseSphere({ getFrequencyData, isPlaying, theme }: VisualizerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uColor1: { value: new THREE.Vector3(...theme.sphere.color1) },
      uColor2: { value: new THREE.Vector3(...theme.sphere.color2) },
      uColor3: { value: new THREE.Vector3(...theme.sphere.color3) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const vertexShader = `
    uniform float uTime;
    uniform float uBass;
    uniform float uMid;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying float vDisplacement;
    varying float vNoise;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;

      // Multi-octave smooth noise for organic undulation
      float slow = uTime * 0.3;
      float n1 = snoise(position * 1.5 + slow) * 0.6;
      float n2 = snoise(position * 3.0 + slow * 1.4) * 0.3;
      float n3 = snoise(position * 6.0 + slow * 2.0) * 0.15;
      vNoise = n1 + n2;

      // Audio-reactive displacement: bass = large deformation, mid = detail
      float bassDisp = n1 * (0.15 + uBass * 0.6);
      float midDisp = n2 * (0.1 + uMid * 0.4);
      float detailDisp = n3 * (0.05 + uBass * 0.15);

      float displacement = bassDisp + midDisp + detailDisp;
      vDisplacement = displacement;

      // Subtle breathing scale
      float breathe = 1.0 + sin(uTime * 0.5) * 0.02 + uBass * 0.08;
      vec3 newPosition = position * breathe + normal * displacement;

      vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying float vDisplacement;
    varying float vNoise;

    void main() {
      // Gentle fresnel for subtle rim highlight
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
      fresnel = pow(fresnel, 4.0);

      // Smooth flowing color based on position + noise + time (view-independent)
      float flow = vNoise + uTime * 0.1;
      float blend1 = sin(flow * 2.0 + vPosition.x) * 0.5 + 0.5;
      float blend2 = cos(flow * 1.5 + vPosition.z) * 0.5 + 0.5;

      // Uniform three-way color mix across the surface
      vec3 baseColor = mix(uColor1, uColor2, blend1);
      baseColor = mix(baseColor, uColor3, blend2 * 0.4 + uHigh * 0.2);

      // Soft rim glow (very subtle)
      vec3 rimColor = uColor3 * fresnel * (0.3 + uBass * 0.3);

      // Displacement highlights
      float ridgeHighlight = smoothstep(0.0, 0.3, abs(vDisplacement)) * 0.12;
      vec3 ridgeColor = mix(uColor2, uColor3, 0.5) * ridgeHighlight;

      vec3 finalColor = baseColor * 0.45 + rimColor + ridgeColor;

      // Uniform transparency with subtle rim fade
      float alpha = 0.4 + fresnel * 0.15 + uBass * 0.1;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;

    const t = clock.getElapsedTime();
    mat.uniforms.uTime.value = t;

    // Smoothly interpolate theme colors
    const target1 = new THREE.Vector3(...theme.sphere.color1);
    const target2 = new THREE.Vector3(...theme.sphere.color2);
    const target3 = new THREE.Vector3(...theme.sphere.color3);
    mat.uniforms.uColor1.value.lerp(target1, 0.05);
    mat.uniforms.uColor2.value.lerp(target2, 0.05);
    mat.uniforms.uColor3.value.lerp(target3, 0.05);

    if (isPlaying) {
      const freq = getFrequencyData();
      if (freq) {
        let bass = 0, mid = 0, high = 0;
        for (let i = 0; i < 30; i++) bass += freq[i];
        for (let i = 30; i < 100; i++) mid += freq[i];
        for (let i = 100; i < freq.length; i++) high += freq[i];
        bass /= 30 * 255;
        mid /= 70 * 255;
        high /= (freq.length - 100) * 255;

        mat.uniforms.uBass.value += (bass - mat.uniforms.uBass.value) * 0.2;
        mat.uniforms.uMid.value += (mid - mat.uniforms.uMid.value) * 0.2;
        mat.uniforms.uHigh.value += (high - mat.uniforms.uHigh.value) * 0.2;
      }
    } else {
      mat.uniforms.uBass.value *= 0.95;
      mat.uniforms.uMid.value *= 0.95;
      mat.uniforms.uHigh.value *= 0.95;
    }

    // Gentle tumble rotation
    mesh.rotation.y = t * 0.12;
    mesh.rotation.x = Math.sin(t * 0.08) * 0.15;
    mesh.rotation.z = Math.cos(t * 0.06) * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.8, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// Particle ring
function ParticleRing({ getFrequencyData, isPlaying, theme }: VisualizerProps) {
  const PARTICLE_COUNT = 2000;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, basePositions } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 3;
      const y = (Math.random() - 0.5) * 2;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      basePositions[i * 3] = positions[i * 3];
      basePositions[i * 3 + 1] = positions[i * 3 + 1];
      basePositions[i * 3 + 2] = positions[i * 3 + 2];
    }
    return { positions, basePositions };
  }, []);

  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;

    const t = clock.getElapsedTime();
    const posAttr = points.geometry.attributes.position;
    const colAttr = points.geometry.attributes.color;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;

    const freq = isPlaying ? getFrequencyData() : null;

    let energy = 0;
    if (freq) {
      for (let i = 0; i < freq.length; i++) energy += freq[i];
      energy /= freq.length * 255;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const angle = Math.atan2(pos[i3 + 2], pos[i3]);
      const freqIdx = Math.floor(
        ((angle + Math.PI) / (Math.PI * 2)) * (freq?.length ?? 128)
      );
      const freqVal = freq ? freq[freqIdx % freq.length] / 255 : 0;

      const orbitSpeed = 0.2 + energy * 0.8;
      const newAngle = angle + orbitSpeed * 0.01;
      const r = Math.sqrt(pos[i3] * pos[i3] + pos[i3 + 2] * pos[i3 + 2]);

      pos[i3] = Math.cos(newAngle) * r;
      pos[i3 + 2] = Math.sin(newAngle) * r;

      pos[i3 + 1] =
        basePositions[i3 + 1] +
        Math.sin(t * 2 + i * 0.01) * 0.5 +
        freqVal * 2;

      const hue = (i / PARTICLE_COUNT + theme.barHueOffset + t * 0.02 + freqVal * 0.3) % 1;
      const color = new THREE.Color().setHSL(hue, theme.particleSaturation, theme.particleLightness + freqVal * 0.3);
      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    points.rotation.y = t * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Outer waveform ring
function WaveformRing({ getTimeData, isPlaying, theme }: VisualizerProps) {
  const SEGMENTS = 256;

  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array((SEGMENTS + 1) * 3);
    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i / SEGMENTS) * Math.PI * 2;
      const r = 6;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const material = new THREE.LineBasicMaterial({
      color: theme.waveColor,
      transparent: true,
      opacity: theme.waveOpacity,
    });
    return new THREE.Line(geometry, material);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const posAttr = lineObj.geometry.attributes.position;
    const pos = posAttr.array as Float32Array;
    const mat = lineObj.material as THREE.LineBasicMaterial;

    // Smoothly transition wave color
    const targetColor = new THREE.Color(theme.waveColor);
    mat.color.lerp(targetColor, 0.05);
    mat.opacity += (theme.waveOpacity - mat.opacity) * 0.05;

    const timeData = isPlaying ? getTimeData() : null;

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i / SEGMENTS) * Math.PI * 2;
      const idx = Math.floor((i / SEGMENTS) * (timeData?.length ?? 128));
      const val = timeData ? (timeData[idx % timeData.length] - 128) / 128 : 0;

      const r = 6 + val * 1.5;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = val * 0.5 + Math.sin(t + angle * 3) * 0.1;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }

    posAttr.needsUpdate = true;
    lineObj.rotation.y = t * 0.08;
  });

  return <primitive object={lineObj} />;
}

export default function Visualizer(props: VisualizerProps) {
  const { mode } = props;
  return (
    <group>
      {mode.sphere && <PulseSphere {...props} />}
      {mode.bars && <FrequencyBars {...props} />}
      {mode.particles && <ParticleRing {...props} />}
      {mode.waveform && <WaveformRing {...props} />}
    </group>
  );
}
