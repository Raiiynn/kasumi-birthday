import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GamePanel, P5Button, P5Title } from "./P5Theme";

/* ─── 1. Ribbon Rush ─────────────────────────────────────────────────────── */
export function RibbonRushGame({ goal = 12, duration = 18, onWin, onBond }) {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const spawn = useCallback(() => {
    idRef.current += 1;
    const id = idRef.current;
    setItems((prev) => [
      ...prev.slice(-10),
      { id, x: 10 + Math.random() * 75, emoji: Math.random() > 0.5 ? "🎀" : "✦" },
    ]);
    setTimeout(() => setItems((p) => p.filter((i) => i.id !== id)), 2000);
  }, []);

  const start = () => {
    setScore(0);
    setTimeLeft(duration);
    setItems([]);
    setPlaying(true);
  };

  const catchItem = (id) => {
    setItems((p) => p.filter((i) => i.id !== id));
    setScore((s) => {
      const n = s + 1;
      if (n >= goal) {
        setPlaying(false);
        onBond?.(15);
        onWin?.();
      }
      return n;
    });
  };

  useEffect(() => {
    if (!playing) return undefined;
    const t = setInterval(() => {
      setTimeLeft((x) => {
        if (x <= 1) {
          setPlaying(false);
          return 0;
        }
        return x - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (!playing) return undefined;
    spawn();
    const s = setInterval(spawn, 700);
    return () => clearInterval(s);
  }, [playing, spawn]);

  return (
    <GamePanel>
      <P5Title sub="Catch Kasumi's ribbon & sparkle!">Ribbon Rush</P5Title>
      <div className="relative mt-4 h-48 overflow-hidden rounded-lg border border-dashed border-rose-500/40 bg-[#12121f]/90">
        {!playing && score < goal && (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <span className="text-3xl">🎀</span>
            <P5Button onClick={start}>Mulai</P5Button>
          </div>
        )}
        {playing && (
          <>
            <div className="absolute left-2 top-2 z-10 flex gap-2 text-xs font-bold text-rose-300">
              <span>{score}/{goal}</span>
              <span>⏱ {timeLeft}s</span>
            </div>
            {items.map((it) => (
              <motion.button
                key={it.id}
                type="button"
                className="absolute text-2xl"
                style={{ left: `${it.x}%`, top: "15%" }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 120, opacity: 1 }}
                transition={{ duration: 2, ease: "linear" }}
                onClick={() => catchItem(it.id)}
              >
                {it.emoji}
              </motion.button>
            ))}
          </>
        )}
        {!playing && score >= goal && (
          <p className="flex h-full items-center justify-center font-bold text-amber-300">
            Perfect! ✦
          </p>
        )}
        {!playing && score > 0 && score < goal && timeLeft === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-sm text-pink-200">Coba lagi!</p>
            <P5Button variant="ghost" onClick={start}>
              Ulang
            </P5Button>
          </div>
        )}
      </div>
    </GamePanel>
  );
}

/* ─── 2. Mask Reveal ─────────────────────────────────────────────────────── */
const DEFAULT_MASKS = [
  { id: "m1", message: "KKasumi? is it kasumi?", image: "/assets/mask-reveal-1.jpg" },
  { id: "m2", message: "You've unlocked Cheerful Kasumi card!", image: "/assets/mask-reveal-2.jpg" },
  { id: "m3", message: "WISH YOU ALL THE BEST", image: "/assets/mask-reveal-3.jpg" },
  { id: "m4", message: "Hihihi dapa always here", image: "/assets/mask-reveal-4.jpg" },
];

function PhantomMaskIcon({ dimmed }) {
  return (
    <svg viewBox="0 0 64 48" className={`h-11 w-14 ${dimmed ? "opacity-30" : "opacity-95"}`} aria-hidden>
      <path
        d="M8 36 Q32 8 56 36 L52 40 Q32 20 12 40 Z"
        fill="#0a0a0a"
        stroke="#e61b41"
        strokeWidth="2"
      />
      <circle cx="32" cy="22" r="4" fill="#e61b41" />
    </svg>
  );
}

function fileLabel(src) {
  if (!src) return "gambar";
  const parts = src.split("/");
  return parts[parts.length - 1] || src;
}

function MaskImage({ src, alt, className = "", size = "large" }) {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const boxClass =
    size === "large"
      ? "min-h-[180px] w-full"
      : "h-16 w-16 shrink-0";

  const imgClass =
    size === "large"
      ? "max-h-[200px] w-full object-contain"
      : "h-16 w-16 object-cover object-top";

  return (
    <div className={`relative ${boxClass} ${className}`}>
      {!loaded && !err && (
        <div className="flex h-full min-h-[inherit] w-full items-center justify-center rounded-lg border border-dashed border-rose-400/30 bg-black/40 text-[10px] text-pink-400/50">
          Memuat…
        </div>
      )}
      {!err && (
        <img
          src={src}
          alt={alt}
          className={`${imgClass} ${!loaded ? "absolute inset-0 h-full w-full opacity-0" : "drop-shadow-[0_8px_24px_rgba(230,27,65,0.4)]"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
        />
      )}
      {err && (
        <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center rounded-lg border border-dashed border-amber-400/50 bg-black/60 px-2 py-3 text-center">
          <span className="text-base text-rose-400/80">🖼</span>
          <p className="mt-1 text-[10px] font-medium text-amber-200/90">{fileLabel(src)}</p>
          <p className="text-[9px] text-pink-500/50">→ public/assets/</p>
        </div>
      )}
    </div>
  );
}

function RevealImage({ src, alt }) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[240px]"
      initial={{ opacity: 0, scale: 0.82, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
    >
      <div className="absolute -inset-3 rounded-2xl bg-rose-500/20 blur-2xl" />
      <div className="relative z-10 overflow-hidden rounded-xl border border-rose-500/25 bg-black/30 p-2">
        <MaskImage src={src} alt={alt} size="large" />
      </div>
    </motion.div>
  );
}

export function MaskRevealGame({
  masks = DEFAULT_MASKS,
  defaultImage = "/assets/kasumi-reveal.png",
  onComplete,
  onBond,
  onFlash,
}) {
  const [revealed, setRevealed] = useState([]);
  const [active, setActive] = useState(null);

  const reveal = (m) => {
    if (revealed.includes(m.id)) return;
    const image = m.image || defaultImage;
    setActive({ ...m, image });
    onFlash?.("SHOWTIME!");
    setTimeout(() => {
      setRevealed((r) => [...r, m.id]);
      onBond?.(4);
      if (revealed.length + 1 >= masks.length) {
        onBond?.(10);
        onComplete?.();
      }
    }, 120);
  };

  const done = revealed.length >= masks.length;

  return (
    <GamePanel>
      <P5Title sub="Ketuk topeng — lihat kejutannya">Mask Reveal</P5Title>

      <div className="relative mt-4 min-h-[240px] overflow-hidden rounded-xl border border-red-900/30 bg-gradient-to-b from-black/60 to-rose-950/20 px-3 py-4">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center"
            >
              <RevealImage src={active.image} alt="Kasumi" />
              <motion.p
                className="mt-4 max-w-[260px] text-center text-sm leading-relaxed text-pink-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
              >
                {active.message}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-[240px] flex-col items-center justify-center gap-3 px-2"
            >
              <p className="text-center text-sm text-pink-400/60">Pilih topeng di bawah…</p>
              <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
                {masks.map((m) => (
                  <div
                    key={m.id}
                    className="flex h-20 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/30"
                  >
                    <PhantomMaskIcon dimmed />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        {masks.map((m) => {
          const isRevealed = revealed.includes(m.id);
          const isActive = active?.id === m.id;
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => reveal(m)}
              disabled={isRevealed}
              className="relative flex flex-col items-center rounded-xl border-2 border-red-900/40 bg-black/50 py-4 focus:outline-none disabled:cursor-default"
              whileHover={!isRevealed ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isRevealed ? { scale: 0.96 } : {}}
              animate={
                isRevealed
                  ? { opacity: 0.55, borderColor: "rgba(245, 215, 142, 0.4)" }
                  : { opacity: 1 }
              }
            >
              <div className="relative flex h-24 w-full items-center justify-center">
                <div className="absolute inset-2 overflow-hidden rounded-lg bg-black/30" />
                <AnimatePresence>
                  {!isRevealed ? (
                    <motion.div
                      className="relative z-10 rounded-lg bg-black/50 px-2 py-1 backdrop-blur-sm"
                      exit={{ scale: 0.6, opacity: 0, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    >
                      <PhantomMaskIcon dimmed={false} />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="relative z-10 overflow-hidden rounded-lg ring-2 ring-amber-400/60"
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <MaskImage src={m.image || defaultImage} alt="" size="thumb" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {done && (
        <motion.p
          className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-amber-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Semua topeng terbuka!
        </motion.p>
      )}
    </GamePanel>
  );
}

/* ─── 8. All-Out Attack ──────────────────────────────────────────────────── */
export function AllOutAttackGame({ duration = 3, onComplete, onBond, onFlash }) {
  const [phase, setPhase] = useState("idle");
  const [damage, setDamage] = useState(0);
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);

  const start = () => {
    setDamage(0);
    setTaps(0);
    setTimeLeft(duration);
    setPhase("attack");
    onFlash?.("ALL-OUT ATTACK!");
  };

  useEffect(() => {
    if (phase !== "attack") return undefined;
    const t = setInterval(() => {
      setTimeLeft((x) => {
        if (x <= 0.1) {
          setPhase("result");
          onBond?.(15);
          onComplete?.();
          return 0;
        }
        return x - 0.1;
      });
    }, 100);
    return () => clearInterval(t);
  }, [phase, onBond, onComplete]);

  const strike = () => {
    if (phase !== "attack") return;
    const bonus = 120 + Math.floor(Math.random() * 180);
    setTaps((t) => t + 1);
    setDamage((d) => d + bonus);
  };

  return (
    <GamePanel>
      <P5Title sub="Spam STRIKE! 3 detik">All-Out Attack</P5Title>

      <div className="mt-4 text-center">
        <AnimatePresence mode="wait">
          {phase === "result" ? (
            <motion.div
              key="result"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4"
            >
              <p className="p5-title text-4xl font-black italic text-amber-400 sm:text-5xl">
                SUPERB!
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {damage.toLocaleString()} DMG
              </p>
              <p className="text-xs text-pink-400">{taps} hits</p>
            </motion.div>
          ) : (
            <motion.div key="fight" className="py-2">
              <p className="text-3xl font-black tabular-nums text-rose-400">
                {phase === "attack" ? damage.toLocaleString() : "—"}
              </p>
              {phase === "attack" && (
                <p className="text-[10px] uppercase text-pink-400">
                  {timeLeft.toFixed(1)}s
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "idle" && (
          <P5Button className="mt-4" onClick={start}>
            Strike!
          </P5Button>
        )}

        {phase === "attack" && (
          <motion.button
            type="button"
            onClick={strike}
            className="mt-4 w-full skew-x-[-4deg] rounded-lg bg-gradient-to-r from-red-700 via-red-600 to-red-800 py-6 text-2xl font-black uppercase italic text-white shadow-[0_6px_0_#4a0515]"
            whileTap={{ scale: 0.95, y: 4 }}
          >
            STRIKE!
          </motion.button>
        )}

        {phase === "result" && (
          <P5Button variant="ghost" className="mt-4" onClick={() => setPhase("idle")}>
            Lagi
          </P5Button>
        )}
      </div>
    </GamePanel>
  );
}
