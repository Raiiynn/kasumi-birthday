import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function parseTenorId(url) {
  if (!url) return null;
  const embed = url.match(/tenor\.com\/embed\/(\d+)/);
  if (embed) return embed[1];
  const view = url.match(/gif-(\d+)/);
  if (view) return view[1];
  return null;
}

export function TenorGif({ url, className = "" }) {
  const id = parseTenorId(url);
  if (!id) return null;

  return (
    <iframe
      title="GIF Sumire"
      src={`https://tenor.com/embed/${id}`}
      className={`h-full w-full border-0 ${className}`}
      allowFullScreen
    />
  );
}

export const SiteBgm = forwardRef(function SiteBgm({ src, volume: defaultVolume = 0.35 }, ref) {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(defaultVolume);
  const [playing, setPlaying] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const startedRef = useRef(false);

  const applyVolume = useCallback((v) => {
    const el = audioRef.current;
    if (el) el.volume = v;
  }, []);

  const play = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !src) return;
    try {
      el.muted = false;
      applyVolume(volume);
      el.loop = true;
      await el.play();
      startedRef.current = true;
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [src, volume, applyVolume]);

  useImperativeHandle(ref, () => ({ play }), [play]);

  useEffect(() => {
    setVolume(defaultVolume);
  }, [defaultVolume]);

  useEffect(() => {
    applyVolume(volume);
  }, [volume, applyVolume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !src) return undefined;

    el.muted = true;
    el.volume = 0;
    el.play()
      .then(() => {
        el.muted = false;
        applyVolume(volume);
        startedRef.current = true;
        setPlaying(true);
      })
      .catch(() => {});

    const resume = () => {
      if (!startedRef.current) play();
    };
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("touchstart", resume, { once: true });

    return () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("touchstart", resume);
    };
  }, [src, volume, play, applyVolume]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) play();
    else {
      el.pause();
      setPlaying(false);
    }
  };

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" loop />

      <div className="fixed right-3 top-3 z-[60] sm:right-4 sm:top-4">
        <motion.button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/40 bg-black/75 text-base shadow-lg backdrop-blur-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Pengaturan musik"
          aria-expanded={panelOpen}
        >
          {playing ? "🔊" : "🔇"}
        </motion.button>

        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-44 rounded-xl border border-rose-500/30 bg-black/90 p-3 shadow-xl backdrop-blur-md"
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-pink-300/80">
                Volume BGM
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="mb-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-rose-500"
                aria-label="Volume musik"
              />
              <p className="mb-2 text-center text-xs text-pink-200/70">
                {Math.round(volume * 100)}%
              </p>
              <button
                type="button"
                onClick={togglePlay}
                className="w-full rounded-lg bg-rose-600/80 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
              >
                {playing ? "Jeda" : "Putar"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});
