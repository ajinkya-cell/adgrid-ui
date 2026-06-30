"use client";

import { useRef, useCallback, useEffect } from "react";

import type { UseAudioReturn } from "../types";
import { playClickSoundWithVolume, playHoverSound } from "../utils/audio";

export function useAudio(): UseAudioReturn {
  const volumeRef = useRef(0.04);
  const enabledRef = useRef(true);
  const lastClickTimeRef = useRef(0);
  const lastHoverTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const playClick = useCallback(
    (volume?: number) => {
      if (!enabledRef.current) return;

      const now = Date.now();
      if (now - lastClickTimeRef.current < 45) return;
      lastClickTimeRef.current = now;

      const vol = volume !== undefined ? volume : volumeRef.current;
      playClickSoundWithVolume(vol);
    },
    []
  );

  const playHover = useCallback(
    (volume?: number) => {
      if (!enabledRef.current) return;

      const now = Date.now();
      if (now - lastHoverTimeRef.current < 100) return;
      lastHoverTimeRef.current = now;

      const vol = volume !== undefined ? volume : volumeRef.current * 0.5;
      playHoverSound(vol);
    },
    []
  );

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.max(0, Math.min(1, volume));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return {
    playClick,
    playHover,
    setVolume,
    setEnabled,
  };
}