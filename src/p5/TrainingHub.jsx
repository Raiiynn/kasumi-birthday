import { useState } from "react";
import { motion } from "framer-motion";
import { AllOutAttackGame, MaskRevealGame, RibbonRushGame } from "./minigames";
import { ConfidantBar, P5Button, P5Card, P5Flash, P5Title } from "./P5Theme";

const GAMES = [
  { id: "ribbon", label: "Ribbon Rush", icon: "🎀", desc: "Catch the Ribbon and Sparkles!" },
  { id: "mask", label: "Mask Reveal", icon: "🎭", desc: "Reveal the Mask" },
  { id: "aoa", label: "All-Out Attack", icon: "⚔", desc: "STRIKE!" },
];

export function TrainingHub({
  config,
  bond,
  maxBond,
  name,
  completed,
  onCompleteGame,
  onBond,
  onContinue,
  onFlash,
}) {
  const [activeGame, setActiveGame] = useState(null);
  const allDone = GAMES.every((g) => completed.includes(g.id));

  const markDone = (id) => {
    if (!completed.includes(id)) onCompleteGame(id);
  };

  return (
    <motion.div
      key="training"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex w-full flex-col items-center px-2"
    >
      <ConfidantBar bond={bond} maxBond={maxBond} name={name} />

      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.25em] text-amber-400/80">
        {config.tagline}
      </p>
      <P5Title sub={config.subtitle}>{config.title}</P5Title>

      {!activeGame ? (
        <>
          <div className="mt-6 grid w-full max-w-sm gap-3">
            {GAMES.map((g) => (
              <P5Card
                key={g.id}
                onClick={() => setActiveGame(g.id)}
                done={completed.includes(g.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <p className="font-bold uppercase text-white">{g.label}</p>
                    <p className="text-xs text-pink-300/60">{g.desc}</p>
                  </div>
                  {completed.includes(g.id) && (
                    <span className="ml-auto text-amber-400">✓</span>
                  )}
                </div>
              </P5Card>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-pink-400/70">
            {completed.length}/{GAMES.length} mission accomplished
            {!allDone && (
              <span className="mt-1 block text-pink-500/50">
                Complete all to continue
              </span>
            )}
          </p>

          <div className="mt-6 w-full max-w-sm">
            {allDone ? (
              <P5Button fullWidth variant="gold" onClick={onContinue}>
                {config.continueCta}
              </P5Button>
            ) : (
              <div
                className="w-full cursor-not-allowed rounded-lg border-2 border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-pink-400/40"
                aria-disabled="true"
              >
                {config.lockedCta ?? `Kunci — ${completed.length}/${GAMES.length} misi`}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-4 w-full max-w-sm">
          <button
            type="button"
            onClick={() => setActiveGame(null)}
            className="mb-3 text-xs text-pink-400 hover:text-pink-200"
          >
            ← Kembali ke menu
          </button>

          {activeGame === "ribbon" && (
            <RibbonRushGame
              goal={config.ribbon.goal}
              duration={config.ribbon.duration}
              onBond={onBond}
              onWin={() => markDone("ribbon")}
            />
          )}
          {activeGame === "mask" && (
            <MaskRevealGame
              masks={config.masks}
              defaultImage={config.maskRevealImage}
              onBond={onBond}
              onFlash={onFlash}
              onComplete={() => markDone("mask")}
            />
          )}
          {activeGame === "aoa" && (
            <AllOutAttackGame
              duration={config.allOut.duration}
              onBond={onBond}
              onFlash={onFlash}
              onComplete={() => markDone("aoa")}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}

export function useP5Flash() {
  const [flash, setFlash] = useState({ show: false, text: "" });

  const trigger = (text = "") => {
    setFlash({ show: true, text });
    setTimeout(() => setFlash({ show: false, text: "" }), 1400);
  };

  return { flash, trigger, Flash: () => <P5Flash show={flash.show} text={flash.text} /> };
}
