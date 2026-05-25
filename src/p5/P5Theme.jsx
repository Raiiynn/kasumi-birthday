import { AnimatePresence, motion } from "framer-motion";

export const BOND_RANKS = [
  { min: 0, label: "Rank 1", title: "Acquaintance" },
  { min: 15, label: "Rank 2", title: "Friend" },
  { min: 30, label: "Rank 3", title: "Familiar" },
  { min: 50, label: "Rank 4", title: "Intimate" },
  { min: 70, label: "Rank 5", title: "Spesial" },
  { min: 90, label: "MAX", title: "Confidant MAX" },
];

export function getBondRank(bond) {
  let current = BOND_RANKS[0];
  for (const r of BOND_RANKS) {
    if (bond >= r.min) current = r;
  }
  return current;
}

export function P5Background({ variant = "dark" }) {
  if (variant === "soft") {
    return (
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a12] via-[#120818] to-[#0f101a]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(45deg,#e61b41_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b14] via-[#12121f] to-[#1a0810]" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(230,27,65,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(230,27,65,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-red-600/15 blur-[90px]" />
      <div className="absolute -right-16 bottom-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-[80px]" />
    </div>
  );
}

/** Notifikasi lembut — tanpa layar putih kilat (ramah epilepsi) */
export function P5Flash({ show, text }) {
  return (
    <AnimatePresence>
      {show && text && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-16 z-[100] flex justify-center px-4"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="status"
          aria-live="polite"
        >
          <p className="max-w-sm rounded-lg border border-rose-500/35 bg-black/90 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-rose-200/95 shadow-lg sm:text-sm">
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfidantBar({ bond, maxBond = 100, name }) {
  const rank = getBondRank(bond);
  const pct = Math.min(100, (bond / maxBond) * 100);

  return (
    <motion.div
      className="mb-4 w-full rounded-lg border border-amber-400/30 bg-black/50 px-3 py-2 backdrop-blur-md"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-amber-200/80">
        <span>Confidant · {name}</span>
        <span className="font-bold text-rose-400">{rank.label}</span>
      </div>
      <p className="text-[11px] text-pink-200/70">{rank.title}</p>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120 }}
        />
      </div>
      <p className="mt-0.5 text-right text-[9px] text-pink-300/50">
        Bond {Math.floor(bond)}/{maxBond}
      </p>
    </motion.div>
  );
}

export function P5Title({ children, sub }) {
  return (
    <div className="text-center">
      <h2 className="p5-title text-2xl font-black uppercase italic tracking-wide text-white sm:text-3xl">
        {children}
      </h2>
      {sub && <p className="mt-1 text-xs text-pink-300/70">{sub}</p>}
    </div>
  );
}

export function P5Button({ children, onClick, variant = "red", className = "", fullWidth }) {
  const styles = {
    red: "bg-gradient-to-r from-red-700 to-red-600 border-red-400/50 text-white",
    gold: "bg-gradient-to-r from-amber-600 to-amber-500 border-amber-300/50 text-[#0f101a]",
    ghost: "bg-white/10 border-white/20 text-pink-100",
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, skewX: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`p5-skew-btn border-2 px-6 py-3 text-sm font-bold uppercase tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.4)] ${styles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <span className="inline-block skew-x-3">{children}</span>
    </motion.button>
  );
}

export function P5Card({ children, onClick, active, done }) {
  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`p5-card w-full rounded-lg border-2 p-4 text-left transition-colors ${
        done
          ? "border-amber-400/60 bg-amber-950/30"
          : active
            ? "border-rose-500 bg-rose-950/40"
            : "border-white/15 bg-black/40"
      }`}
    >
      {children}
    </Wrapper>
  );
}

export function GamePanel({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-sm rounded-xl border-2 border-red-900/40 bg-black/60 p-4 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
