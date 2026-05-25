import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import ConfettiBackground from "./components/ConfettiBackground";
import { SiteBgm, TenorGif, parseTenorId } from "./p5/media";
import { TrainingHub, useP5Flash } from "./p5/TrainingHub";

/* ═══════════════════════════════════════════════════════════════════════════
   KONFIGURASI
   ═══════════════════════════════════════════════════════════════════════════ */
export const BIRTHDAY_CONFIG = {
  crushName: "Kaicumicumi",
  totalSteps: 5,
  maxBond: 100,

  p5: {
    tagline: "Take your heart",
    flashTexts: {
      start: "BEGIN!",
      showtime: "SHOWTIME!",
      allOut: "ALL-OUT ATTACK!",
    },
  },

  bondRewards: {
    landing: 5,
    perBalloon: 3,
    balloonsDone: 10,
    perGame: 15,
    claimGift: 20,
  },

  landing: {
    badge: "There's a surprise for you!",
    subtitle: "BIRTHDAY SURPRISE FOR",
    intro: "cumi cumi made this especially for you. Ready?",
    cta: "Uncover Your Surprise!",
  },

  balloons: [
    { id: "b1", color: "pink", message: "THIS IS FOR YOUR SPECIAL BIRTHDAY" },
    { id: "b2", color: "yellow", message: "May this year be full of sweet things!" },
    { id: "b3", color: "mint", message: "Thank you for being the best version of yourself." },
    { id: "b4", color: "cyan", message: "I'm proud of you!! always." },
    { id: "b5", color: "lavender", message: "Next — there are fun games! ✨" },
  ],

  balloonsStep: {
    title: "Pop the balloon!",
    hint: "There is a message inside every balloon…",
    nextCta: "Enter Mementos Training",
  },

  bgm: {
    src: "/assets/audio/website-bgm.mp3",
    volume: 0.35,
  },

  training: {
    title: "Mementos",
    subtitle: "Complete missions to increase Confidant Rank",
    tagline: "Take your heart",
    continueCta: "Next →",
    lockedCta: "Complete all missions first",
    ribbon: { goal: 12, duration: 18 },
    allOut: { duration: 3 },
    /* Fallback jika satu topeng tidak punya field image */
    maskRevealImage: "/assets/mask-reveal-1.jpg",
    /* Satu topeng = satu gambar + satu pesan */
    masks: [
      {
        id: "m1",
        message: "KKasumi? is it kasumi?",
        image: "/assets/mask-reveal-1.jpg",
      },
      {
        id: "m2",
        message: "You've unlocked Cheerful Kasumi card!",
        image: "/assets/mask-reveal-2.jpg",
      },
      {
        id: "m3",
        message: "Happy birthday, {{name}}! WISH YOU ALL THE BEST!!!",
        image: "/assets/mask-reveal-3.jpg",
      },
      {
        id: "m4",
        message: "Hihihi dapa always here.",
        image: "/assets/mask-reveal-4.jpg",
      },
    ],
  },

  messageForYou: {
    title: "Message For you",
    gifUrl:
      "https://tenor.com/view/sumire-yoshizawa-sumire-kasumi-kasumi-yoshizawa-persona-5-gif-5093524295216581380",
    polaroidCaption: "Today is special. Not because of cake or gifts. But because you've been on this planet one more year, hihii",
    signature: "— dapawapawapa",
    giftLabel: "Your choice of gift:",
    gifts: ["Xiaomimi", "Kasumi", "Dapawapawapa"],
    claimCta: "Claim Gift!",
    claimHint: "Choose your gift first ♥",
  },

  finale: {
    title: "Happy Birthday!",
    subtitle: "Sweet and joyfull {{name}}",
    cta: "All-Out Confetti!",
    celebrationImage: "/assets/birthdaykasumi.jpg",
  },

  footerText: "from dapawapawapa · kaicumi special birthday",

  colors: {
    confetti: ["#e61b41", "#f472b6", "#f5d78e", "#0f101a", "#38bdf8"],
  },
};

const BALLOON_STYLES = {
  pink: "from-pink-400 to-rose-500",
  yellow: "from-amber-300 to-yellow-400",
  mint: "from-emerald-300 to-teal-400",
  cyan: "from-sky-300 to-cyan-400",
  lavender: "from-violet-300 to-purple-400",
};

const STEPS = ["landing", "balloons", "training", "message", "finale"];

function mergeConfig(base, override) {
  if (!override) return base;
  return {
    ...base,
    ...override,
    p5: { ...base.p5, ...(override.p5 ?? {}) },
    bondRewards: { ...base.bondRewards, ...(override.bondRewards ?? {}) },
    landing: { ...base.landing, ...(override.landing ?? {}) },
    balloons: override.balloons ?? base.balloons,
    balloonsStep: { ...base.balloonsStep, ...(override.balloonsStep ?? {}) },
    bgm: { ...base.bgm, ...(override.bgm ?? {}) },
    training: {
      ...base.training,
      ...(override.training ?? {}),
      ribbon: { ...base.training.ribbon, ...(override.training?.ribbon ?? {}) },
      allOut: { ...base.training.allOut, ...(override.training?.allOut ?? {}) },
      masks: override.training?.masks ?? base.training.masks,
    },
    messageForYou: { ...base.messageForYou, ...(override.messageForYou ?? {}) },
    finale: { ...base.finale, ...(override.finale ?? {}) },
    colors: { ...base.colors, ...(override.colors ?? {}) },
  };
}

function personalize(text, name) {
  return text.replaceAll("{{name}}", name).replaceAll("Sumire", name);
}

function PillButton({ children, onClick, fullWidth }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-8 py-4 font-bold text-white shadow-[0_6px_24px_rgba(230,27,65,0.4)] ${fullWidth ? "w-full max-w-sm" : ""}`}
    >
      {children}
    </motion.button>
  );
}

function BalloonShape({ color, popped }) {
  const g = BALLOON_STYLES[color] ?? BALLOON_STYLES.pink;
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className={`h-20 w-16 rounded-[50%] bg-gradient-to-br sm:h-24 sm:w-[4.5rem] ${g} ${popped ? "opacity-0" : "shadow-lg"}`}
        animate={popped ? { scale: 1.5, opacity: 0 } : { y: [0, -8, 0] }}
        transition={popped ? { duration: 0.3 } : { duration: 2.5, repeat: Infinity }}
      />
      {!popped && <div className="h-6 w-px bg-white/30" />}
      {popped && <span className="absolute text-xl">💥</span>}
    </div>
  );
}

function BalloonPopStep({ balloons, copy, onComplete, onPop }) {
  const [popped, setPopped] = useState([]);
  const [msg, setMsg] = useState(null);

  const pop = (b) => {
    if (popped.includes(b.id)) return;
    setPopped((p) => [...p, b.id]);
    setMsg(b.message);
    onPop?.();
  };

  const done = popped.length >= balloons.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex w-full flex-col items-center px-4"
    >
      <h2 className="p5-title text-center text-2xl font-black uppercase italic text-white sm:text-3xl">
        {copy.title}
      </h2>
      <p className="mt-2 text-center text-sm text-pink-300/70">{copy.hint}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {balloons.slice(0, 3).map((b, i) => (
          <button key={b.id} type="button" onClick={() => pop(b)} disabled={popped.includes(b.id)} className="focus:outline-none">
            <BalloonShape color={b.color} popped={popped.includes(b.id)} />
          </button>
        ))}
      </div>
      {balloons.length > 3 && (
        <div className="mt-6 flex justify-center gap-10">
          {balloons.slice(3).map((b) => (
            <button key={b.id} type="button" onClick={() => pop(b)} disabled={popped.includes(b.id)} className="focus:outline-none">
              <BalloonShape color={b.color} popped={popped.includes(b.id)} />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 min-h-[4rem] w-full max-w-sm rounded-lg border border-red-900/40 bg-black/50 px-4 py-3 text-center text-sm text-pink-100">
        {msg || "…"}
      </div>

      {done && (
        <div className="mt-6">
          <PillButton fullWidth onClick={onComplete}>
            {copy.nextCta}
          </PillButton>
        </div>
      )}
    </motion.div>
  );
}

function CustomGif({ url, caption, signature }) {
  const [err, setErr] = useState(false);
  const trimmed = url?.trim();
  const tenorId = parseTenorId(trimmed);
  const isDirect = trimmed && !tenorId && !trimmed.includes("tenor.com/view");

  return (
    <motion.div
      className="mx-auto w-full max-w-[300px] rotate-2 rounded bg-white p-3 pb-8 shadow-polaroid"
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      <div className="aspect-[4/5] overflow-hidden rounded-sm bg-pink-50">
        {tenorId ? (
          <TenorGif url={trimmed} />
        ) : isDirect && !err ? (
          <img
            src={trimmed}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setErr(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-gray-400">
            <span className="text-3xl">🎀</span>
            <p>{err ? "GIF gagal dimuat" : "GIF belum diset"}</p>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between px-1 text-sm">
        <span className="font-script text-gray-500">{caption}</span>
        <span className="max-w-[50%] text-right text-[10px] text-gray-400">{signature}</span>
      </div>
    </motion.div>
  );
}

function MessageStep({ config, onClaim, onBack }) {
  const [gift, setGift] = useState(config.gifts[0]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex w-full flex-col items-center px-4"
    >
      <h2 className="font-script text-3xl text-rose-400">{config.title} 💌</h2>
      <div className="mt-6">
        <CustomGif url={config.gifUrl} caption={config.polaroidCaption} signature={config.signature} />
      </div>
      <div className="mt-6 w-full max-w-sm rounded-full border border-white/10 bg-black/40 px-4 py-4 text-center">
        <p className="text-xs text-pink-400/70">{config.giftLabel}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {config.gifts.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGift(g)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${gift === g ? "bg-red-600 text-white" : "bg-white/10 text-pink-100"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="mt-2 font-bold text-white">{gift}</p>
      </div>
      <div className="mt-6 w-full max-w-sm">
        <PillButton fullWidth onClick={() => onClaim(gift)}>
          🎁 {config.claimCta}
        </PillButton>
      </div>
      <button type="button" onClick={onBack} className="mt-4 text-xs text-pink-500/70 hover:underline">
        ← Training
      </button>
    </motion.div>
  );
}

function LandingStep({ config, name, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center"
    >
      <span className="rounded-full border border-rose-500/40 bg-black/40 px-4 py-2 text-sm font-bold text-rose-400">
        🎂 {config.badge}
      </span>
      <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-pink-500/60">{config.subtitle}</p>
      <h1 className="mt-2 font-script text-5xl text-rose-400 sm:text-6xl">{name}</h1>
      <p className="mt-4 max-w-xs text-sm text-pink-200/70">{config.intro}</p>
      <div className="mt-10">
        <PillButton onClick={onStart}>🎁 {config.cta}</PillButton>
      </div>
    </motion.div>
  );
}

function FinaleStep({ config, name, bond, onCelebrate }) {
  const maxed = bond >= 90;
  const imgSrc = config.celebrationImage || "/assets/birthdaykasumi.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center"
    >
      <p className="text-[10px] uppercase tracking-widest text-amber-400">
        {maxed ? "CONFIDANT MAX" : "MISSION CLEAR"}
      </p>
      <h2 className="p5-title mt-2 text-3xl font-black italic text-white sm:text-4xl">
        {config.title}
      </h2>
      <p className="mt-2 text-pink-300/80">{personalize(config.subtitle, name)}</p>

      <motion.div
        className="relative mt-6 w-full max-w-xs"
        initial={{ opacity: 0, y: 24, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 140, damping: 16 }}
      >
        <div className="absolute -inset-4 rounded-2xl bg-rose-600/20 blur-2xl" />
        <img
          src={imgSrc}
          alt={`Selamat ulang tahun ${name}`}
          className="relative z-10 mx-auto max-h-72 w-auto rounded-xl object-contain shadow-[0_16px_48px_rgba(230,27,65,0.35)]"
        />
      </motion.div>

      <div className="mt-8">
        <PillButton onClick={onCelebrate}>{config.cta}</PillButton>
      </div>
    </motion.div>
  );
}

export default function BirthdayPage({ config: configOverride }) {
  const config = useMemo(() => mergeConfig(BIRTHDAY_CONFIG, configOverride), [configOverride]);
  const { crushName, colors, totalSteps, maxBond, bondRewards, training } = config;

  const [step, setStep] = useState("landing");
  const [bond, setBond] = useState(0);
  const [gamesDone, setGamesDone] = useState([]);
  const { flash, trigger, Flash } = useP5Flash();
  const bgmRef = useRef(null);

  const startBgm = useCallback(() => {
    bgmRef.current?.play?.();
  }, []);

  const addBond = useCallback(
    (amount) => setBond((b) => Math.min(maxBond, b + amount)),
    [maxBond]
  );

  const fireConfetti = useCallback(() => {
    const p = colors.confetti;
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 }, colors: p });
    confetti({ angle: 60, particleCount: 60, origin: { x: 0, y: 0.65 }, colors: p });
    confetti({ angle: 120, particleCount: 60, origin: { x: 1, y: 0.65 }, colors: p });
  }, [colors.confetti]);

  const masksPersonalized = useMemo(
    () =>
      training.masks.map((m) => ({
        ...m,
        message: personalize(m.message, crushName),
      })),
    [training.masks, crushName]
  );

  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-x-hidden text-pink-50">
      <ConfettiBackground particleCount={130} />
      <SiteBgm ref={bgmRef} src={config.bgm?.src} volume={config.bgm?.volume ?? 0.35} />
      <Flash />

      <div className="relative z-10 mx-auto flex min-h-screen min-h-[100dvh] max-w-lg flex-col px-4 pb-8 pt-6 sm:max-w-xl">
          <div className="flex flex-1 flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step === "landing" && (
              <LandingStep
                config={config.landing}
                name={crushName}
                onStart={() => {
                  addBond(bondRewards.landing);
                  trigger(config.p5.flashTexts?.start ?? "BEGIN!");
                  startBgm();
                  setStep("balloons");
                }}
              />
            )}

            {step === "balloons" && (
              <BalloonPopStep
                balloons={config.balloons}
                copy={config.balloonsStep}
                onPop={() => addBond(bondRewards.perBalloon)}
                onComplete={() => {
                  addBond(bondRewards.balloonsDone);
                  trigger("NEXT!");
                  setStep("training");
                }}
              />
            )}

            {step === "training" && (
              <TrainingHub
                config={{
                  ...training,
                  masks: masksPersonalized,
                }}
                bond={bond}
                maxBond={maxBond}
                name={crushName}
                completed={gamesDone}
                onCompleteGame={(id) => {
                  setGamesDone((d) => (d.includes(id) ? d : [...d, id]));
                  addBond(bondRewards.perGame);
                }}
                onBond={addBond}
                onFlash={trigger}
                onContinue={() => {
                  trigger("CLEAR!");
                  setStep("message");
                }}
              />
            )}

            {step === "message" && (
              <MessageStep
                config={config.messageForYou}
                onClaim={(gift) => {
                  addBond(bondRewards.claimGift);
                  fireConfetti();
                  trigger("MAX!");
                  setStep("finale");
                  if (navigator.share) {
                    try {
                      navigator.share({
                        title: "Hadiah",
                        text: `Pilih: ${gift}! ♥`,
                      });
                    } catch {
                      /* noop */
                    }
                  }
                }}
                onBack={goBack}
              />
            )}

            {step === "finale" && (
              <FinaleStep
                config={config.finale}
                name={crushName}
                bond={bond}
                onCelebrate={fireConfetti}
              />
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-auto pt-4 text-center text-[10px] text-pink-500/40">
          {config.footerText}
        </footer>
      </div>
    </div>
  );
}
