import { useCallback, useRef, useState } from "react";

export interface AudioAnalyzerState {
  isPlaying: boolean;
  fileName: string | null;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array | null;
  timeData: Uint8Array | null;
}

export function useAudioAnalyzer() {
  const [state, setState] = useState<AudioAnalyzerState>({
    isPlaying: false,
    fileName: null,
    analyser: null,
    frequencyData: null,
    timeData: null,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const timeDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const ensureContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const setupAnalyser = useCallback(
    (ctx: AudioContext) => {
      // Reuse existing analyser if possible
      if (analyserRef.current) return analyserRef.current;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.frequencyBinCount);
      freqDataRef.current = frequencyData;
      timeDataRef.current = timeData;

      return analyser;
    },
    []
  );

  const stopAll = useCallback(() => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  // Load from a URL (preset tracks)
  const loadUrl = useCallback(
    async (url: string, name: string) => {
      stopAll();

      const ctx = ensureContext();
      if (ctx.state === "suspended") await ctx.resume();

      const analyser = setupAnalyser(ctx);

      // Use HTMLAudioElement for URL-based playback (streaming, no full decode)
      if (!audioElRef.current) {
        audioElRef.current = new Audio();
      }
      const audio = audioElRef.current;
      audio.src = url;
      audio.crossOrigin = "anonymous";

      // Connect media element source (only once per element)
      if (!mediaSourceRef.current) {
        const mediaSource = ctx.createMediaElementSource(audio);
        mediaSource.connect(analyser);
        analyser.connect(ctx.destination);
        mediaSourceRef.current = mediaSource;
      }

      audio.onended = () => {
        setState((s) => ({ ...s, isPlaying: false }));
      };

      try {
        await audio.play();
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        throw e;
      }

      setState({
        isPlaying: true,
        fileName: name,
        analyser,
        frequencyData: freqDataRef.current,
        timeData: timeDataRef.current,
      });
    },
    [stopAll, ensureContext, setupAnalyser]
  );

  // Load from a File object (user upload)
  const loadFile = useCallback(
    async (file: File) => {
      stopAll();

      // Disconnect HTMLAudioElement source if it exists, we'll use buffer source
      // Actually, we need a fresh context to avoid conflicts
      const ctx = ensureContext();
      if (ctx.state === "suspended") await ctx.resume();

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const analyser = setupAnalyser(ctx);

      // Disconnect old media source and reconnect analyser to destination
      // The analyser is already connected, just create new buffer source
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      // Ensure analyser → destination
      analyser.connect(ctx.destination);
      source.start(0);
      sourceRef.current = source;

      source.onended = () => {
        setState((s) => ({ ...s, isPlaying: false }));
      };

      setState({
        isPlaying: true,
        fileName: file.name,
        analyser,
        frequencyData: freqDataRef.current,
        timeData: timeDataRef.current,
      });
    },
    [stopAll, ensureContext, setupAnalyser]
  );

  const getFrequencyData = useCallback(() => {
    if (analyserRef.current && freqDataRef.current) {
      analyserRef.current.getByteFrequencyData(freqDataRef.current);
      return freqDataRef.current;
    }
    return null;
  }, []);

  const getTimeData = useCallback(() => {
    if (analyserRef.current && timeDataRef.current) {
      analyserRef.current.getByteTimeDomainData(timeDataRef.current);
      return timeDataRef.current;
    }
    return null;
  }, []);

  return {
    ...state,
    loadFile,
    loadUrl,
    stop: stopAll,
    getFrequencyData,
    getTimeData,
  };
}
