"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

function SkillsMarquee({ skills }: { skills: string[] }) {
  const duplicated = [...skills, ...skills];
  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex w-max shrink-0 animate-marquee"
        style={{
          animationDuration: `${20}s`,
        }}
      >
        {duplicated.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="mx-2 whitespace-nowrap text-lg text-white uppercase"
          >
            {item},
          </span>
        ))}
      </div>

      {/* Optional fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-neutral-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-neutral-950 to-transparent" />
    </div>
  );
}

function ProjectCard({
  src,
  logoSrc,
  alt,
  project,
  description,
  year,
  skills,
  href,
  index = 0,
}: {
  src: string;
  logoSrc: string;
  alt: string;
  project: string;
  description: string;
  year: string;
  skills?: string[];
  href?: string;
  index?: number;
}) {
  const cardContent = (
    <>
      {/* Image — sits on a dark frame, shown in full (object-contain) so wide
          screenshots are never cropped. 3:2 box matches the source ratio, so
          there's no letterboxing for these assets. */}
      <div className="relative aspect-3/2 w-full overflow-hidden rounded-2xl bg-neutral-900">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) calc(50vw - 4rem), calc(100vw - 3.5rem)"
          className="object-contain"
        />
      </div>

      {/* Meta — kept off the image so it's always legible (white on near-black) */}
      <div className="px-3 pb-3 pt-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
              <Image
                src={logoSrc}
                alt={alt}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-white lg:text-xl">
              {project}
            </h3>
          </div>
          <p className="shrink-0 pt-0.5 text-lg font-semibold uppercase tracking-wide text-neutral-300">
            {year}
          </p>
        </div>

        <p className="mt-4 max-w-prose text-lg leading-relaxed text-neutral-400">
          {description}
        </p>

        <div className="mt-6">
          {skills && skills.length > 0 && <SkillsMarquee skills={skills} />}
        </div>
      </div>
    </>
  );

  // Shared motion props for the entrance reveal.
  const reveal = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, ease, delay: index * 0.1 },
  } as const;

  // Whole-card hover: lifts and subtly scales up. whileHover takes priority
  // over the whileInView resting state while the pointer is over the card. The
  // spring transition is scoped to the hover/tap states so the entrance reveal
  // keeps its own eased timing.
  const hoverSpring = { type: "spring" as const, stiffness: 260, damping: 24 };
  const hover = {
    whileHover: { y: -8, scale: 1.015, transition: hoverSpring },
    whileTap: { scale: 0.99, transition: hoverSpring },
  };

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project} — opens in a new tab`}
        className="group flex flex-col rounded-3xl bg-neutral-950 p-3 cursor-pointer transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/25"
        {...reveal}
        {...hover}
      >
        {cardContent}
      </motion.a>
    );
  }

  return (
    <motion.article
      className="group flex flex-col rounded-3xl bg-neutral-950 p-3 transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/25"
      {...reveal}
    >
      {cardContent}
    </motion.article>
  );
}

// Hero collage — the three work-boards fanned out like photos on a desk.
// Outer cards tilt and tuck under the centre card via negative margins; widths
// are clamp()-driven so the fan scales fluidly from phone to ultrawide without
// ever overflowing its row.
const HERO_COLLAGE = [
  {
    src: "/work/goEasy/work-board.png",
    alt: "goEasy work board",
    rotate: -6,
    restY: 14,
    widthClass: "w-full md:w-[clamp(6.5rem,34vw,36rem)]",
    marginClass: "md:-mr-10 lg:-mr-14",
    zClass: "z-10",
  },
  {
    src: "/work/salt-and-straw/work-board.png",
    alt: "Salt & Straw work board",
    rotate: 0,
    restY: -8,
    widthClass: "w-full md:w-[clamp(7.5rem,36vw,40rem)]",
    marginClass: "",
    zClass: "z-20",
  },
  {
    src: "/work/satej-oils/work-board.png",
    alt: "Satej Oils work board",
    rotate: 6,
    restY: 14,
    widthClass: "w-full md:w-[clamp(6.5rem,34vw,40rem)]",
    marginClass: "md:-ml-10 lg:-ml-14",
    zClass: "z-10",
  },
] as const;

// One fanned card. Desktop-only — the fan's tilt/offset run through motion's
// inline transform (which Tailwind's responsive `rotate-*` can't override), and
// this card is rendered inside a `hidden md:flex` wrapper, so it never paints on
// mobile. Small screens get <MobileCarousel /> instead.
function CollageCard({
  src,
  alt,
  rotate,
  restY,
  widthClass,
  marginClass,
  zClass,
}: (typeof HERO_COLLAGE)[number]) {
  const spring = { type: "spring" as const, stiffness: 260, damping: 22 };
  return (
    <motion.div
      className={`relative min-h-0 shrink-0 overflow-hidden rounded-2xl shadow-xl shadow-black/20 aspect-3/2 ${widthClass} ${marginClass} ${zClass}`}
      variants={{
        hidden: { opacity: 0, y: restY + 28, scale: 0.9, rotate },
        visible: {
          opacity: 1,
          y: restY,
          scale: 1,
          rotate,
          transition: { duration: 0.7, ease },
        },
      }}
      whileHover={{
        y: restY - 16,
        rotate: 0,
        scale: 1.06,
        zIndex: 50,
        transition: spring,
      }}
    >
      <Image src={src} alt={alt} fill sizes="40vw" className="object-cover" />
    </motion.div>
  );
}

// Distance/velocity product past which a flick counts as a swipe even when the
// drag distance itself is short.
const SWIPE_CONFIDENCE = 8000;
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

// Mobile-only swipeable carousel — one work-board at a time, drag/flick to
// change, auto-advancing while idle, with tappable dot indicators. `active` is
// false on md+ (where the desktop fan is shown) so the auto-advance timer never
// runs off-screen. We track an ever-increasing index plus the last direction so
// AnimatePresence knows which way to slide; the real card is index mod count.
function MobileCarousel({ active }: { active: boolean }) {
  const count = HERO_COLLAGE.length;
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const current = ((index % count) + count) % count;

  const paginate = useCallback((dir: number) => {
    setState(([i]) => [i + dir, dir]);
  }, []);

  const goTo = useCallback(
    (target: number) => setState(([i]) => [target, target > i ? 1 : -1]),
    [],
  );

  // Auto-advance while visible; reset the timer whenever the slide changes
  // (including manual swipes) so a fresh card always gets its full dwell.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => paginate(1), 4500);
    return () => clearInterval(id);
  }, [active, index, paginate]);

  const card = HERO_COLLAGE[current];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5">
      {/* Flex stage: claims whatever height the hero column has left over. The
          box inside keeps its 3:2 ratio at full size on tall screens, but
          max-h-full lets it shrink into this stage on short phones so the title
          below it always stays within the first fold instead of spilling under
          it. min-h-0 is what allows the shrink in a flex column. */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="relative aspect-3/2 max-h-full w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-xl shadow-black/20">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, { offset, velocity }) => {
                const power = swipePower(offset.x, velocity.x);
                if (power < -SWIPE_CONFIDENCE || offset.x < -60) paginate(1);
                else if (power > SWIPE_CONFIDENCE || offset.x > 60)
                  paginate(-1);
              }}
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                sizes="100vw"
                draggable={false}
                className="pointer-events-none object-cover select-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot indicators — active dot stretches into a pill */}
      <div className="flex items-center gap-2">
        {HERO_COLLAGE.map((c, i) => (
          <button
            key={c.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${c.alt}`}
            aria-current={i === current}
            className="h-2 rounded-full"
          >
            <motion.span
              className="block h-2 rounded-full"
              animate={{
                width: i === current ? 24 : 8,
                backgroundColor:
                  i === current ? "#0a0a0a" : "rgba(10,10,10,0.25)",
              }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// True at the md breakpoint and up. Used only to pause the mobile carousel's
// auto-advance once the desktop fan takes over.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

function HeroCollage() {
  const isDesktop = useIsDesktop();
  return (
    <div className="flex-1 min-h-0 flex items-center justify-center">
      {/* Mobile + tablet: swipeable carousel. Capped width keeps the
          width-driven aspect-3/2 image short enough to fit the hero on wide
          tablets — at full width it grew taller than the available space and
          spilled up under the fixed header. min-h-0 lets it shrink in the flex
          column rather than overflow. */}
      <div className="w-full max-w-xl h-full min-h-0 lg:hidden">
        <MobileCarousel active={!isDesktop} />
      </div>

      {/* Desktop (md+): the fanned-out collage */}
      <motion.div
        className="hidden h-full w-full items-center justify-center lg:flex lg:h-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.3 },
          },
        }}
      >
        {HERO_COLLAGE.map((card) => (
          <CollageCard key={card.src} {...card} />
        ))}
      </motion.div>
    </div>
  );
}

const staggerHeader = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeDown = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

// The blend that keeps this legible over any backdrop lives on the <header>
// (see below), not here: a fixed element creates its own stacking context, so
// `mix-blend-mode` on a *descendant* would only blend against the header's own
// transparent backdrop — never the scrolling page. With the blend on the header
// the whole group inverts against whatever is behind it, so these stay plain:
// white → the strong label, neutral-400 → a muted sub-line, in either polarity.
const InfoBlock = ({ label, sub }: { label: string; sub: string }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-lg font-semibold text-white leading-tight">{label}</p>
    <p className="text-neutral-400 leading-tight">{sub}</p>
  </div>
);

const CONTACT_EMOJIS = [
  "🚀",
  "🤝🏻",
  "🎯",
  "⚡",
  "🔥",
  "💫",
  "🎨",
  "🌊",
  "💎",
  "🤘🏻",
];

function GetInTouchButton() {
  const [emoji, setEmoji] = useState(CONTACT_EMOJIS[0]);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href="mailto:kashyapjagwani@gmail.com"
      variants={fadeDown}
      className="flex items-center bg-neutral-900 text-white rounded-full overflow-hidden cursor-pointer"
      style={{ paddingRight: 20 }}
      onHoverStart={() => {
        setEmoji(
          CONTACT_EMOJIS[Math.floor(Math.random() * CONTACT_EMOJIS.length)],
        );
        setHovered(true);
      }}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Emoji section — zero width by default, rolls open on hover */}
      <motion.div
        className="flex items-center justify-center shrink-0 overflow-hidden"
        animate={
          hovered ? { width: 40, marginLeft: 6 } : { width: 0, marginLeft: 0 }
        }
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: 40 }}
      >
        <motion.span
          className="text-xl leading-none block"
          animate={
            hovered
              ? { rotate: 0, scale: 1, opacity: 1 }
              : { rotate: -120, scale: 0.2, opacity: 0 }
          }
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          {emoji}
        </motion.span>
      </motion.div>

      {/* Text */}
      <motion.span
        className="text-lg font-medium whitespace-nowrap"
        animate={{ paddingLeft: hovered ? 6 : 20 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{ paddingTop: 10, paddingBottom: 10 }}
      >
        Get in touch
      </motion.span>
    </motion.a>
  );
}

// ── My Tech Stack ──
// Grounded in the skills surfaced across the work cards, grouped so a recruiter
// can scan competence by area at a glance.
const TECH_STACK = [
  {
    group: "Frontend",
    items: [
      "React.js",
      "Next.js (SSR, ISR)",
      "TypeScript",
      "Tailwind",
      "Redux State Mngt.",
      "TanStack (React) Query",
      "Framer Motion",
      "JWT & Auth",
      "SEO",
    ],
  },
  {
    group: "Mobile",
    items: ["React Native", "Expo", "iOS", "Android"],
  },
  {
    group: "Backend & Cloud",
    items: [
      "Node.js",
      "Express.js",
      "Databases",
      "MySQL",
      "MongoDB, DynamoDB",
      "Redis",
      "AWS",
      "Vercel",
      "Firebase",
    ],
  },
  {
    group: "Tools & Design",
    items: [
      "Git & GitHub",
      "CI/CD Pipelines",
      "Jest + React Testing Library",
      "Figma",
      "Vite",
      "Contentful",
    ],
  },
] as const;

// Symmetric random in [-range, range].
const jitter = (range: number) => (Math.random() - 0.5) * 2 * range;
const clampAbs = (value: number, max: number) =>
  Math.max(-max, Math.min(max, value));

// Scatter title — a port of Motion's "split text scatter" example, rebuilt
// without the motion-plus `splitText` helper (not in this project). Each glyph
// is its own inline-block span; as the pointer sweeps across a letter it's
// flung in the pointer's direction of travel (with a little randomness) and
// springs home when the pointer leaves. The Reset button snaps every glyph back
// at once — useful on touch, where there's no hover to settle a letter.
function ScatterTitle({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLHeadingElement>(null);
  // Live pointer velocity in px/ms, sampled between pointermove events.
  const velocity = useRef({ x: 0, y: 0 });
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null);

  const scatterSpring = {
    type: "spring" as const,
    stiffness: 110,
    damping: 14,
  };
  const settleSpring = { type: "spring" as const, stiffness: 220, damping: 22 };

  const trackPointer = (event: React.PointerEvent) => {
    const prev = lastPointer.current;
    if (prev) {
      const dt = event.timeStamp - prev.t || 16;
      velocity.current = {
        x: (event.clientX - prev.x) / dt,
        y: (event.clientY - prev.y) / dt,
      };
    }
    lastPointer.current = {
      x: event.clientX,
      y: event.clientY,
      t: event.timeStamp,
    };
  };

  const scatter = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (reduceMotion) return;
    const { x, y } = velocity.current;
    animate(
      event.currentTarget,
      {
        x: clampAbs(x * 60 + jitter(36), 140),
        y: clampAbs(y * 60 + jitter(36), 140),
        rotate: jitter(48),
      },
      scatterSpring,
    );
  };

  const settle = (event: React.PointerEvent<HTMLSpanElement>) =>
    animate(event.currentTarget, { x: 0, y: 0, rotate: 0 }, settleSpring);

  const resetAll = () => {
    containerRef.current
      ?.querySelectorAll<HTMLElement>("[data-scatter-char]")
      .forEach((char) =>
        animate(char, { x: 0, y: 0, rotate: 0 }, settleSpring),
      );
  };

  // Words stay intact (each is an inline-block so it never breaks mid-word),
  // while the per-letter spans inside them carry the scatter transform.
  const words = text.split(" ");

  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
      <h2
        ref={containerRef}
        onPointerMove={trackPointer}
        aria-label={text}
        className={`select-none ${className}`}
      >
        {words.map((word, wordIndex) => (
          <span
            key={`${word}-${wordIndex}`}
            className="inline-block whitespace-nowrap"
          >
            {Array.from(word).map((char, charIndex) => (
              <span
                key={`${char}-${charIndex}`}
                data-scatter-char
                aria-hidden
                onPointerEnter={scatter}
                onPointerLeave={settle}
                className="inline-block will-change-transform"
              >
                {char}
              </span>
            ))}
            {wordIndex < words.length - 1 && (
              <span aria-hidden className="inline-block">
                &nbsp;
              </span>
            )}
          </span>
        ))}
      </h2>

      {/* <motion.button
        type="button"
        onClick={resetAll}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95, rotate: -90 }}
        className="group mb-1.5 inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white/60 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-700 backdrop-blur transition-colors hover:border-neutral-950 hover:text-neutral-950 cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180"
        >
          <path
            d="M3 12a9 9 0 1 1 2.64 6.36M3 12V6m0 6h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Reset
      </motion.button> */}
    </div>
  );
}

// ── Footer ──
// A single frosted-glass tile. The translucent `bg-white/25` + `backdrop-blur`
// lets the giant wordmark behind it show through, blurred and lightened — the
// crisp dark text only reads sharply in the gap between tiles. Hover lifts the
// tile and nudges the arrow, matching the work-card interaction language.
function FooterTile({
  label,
  href,
  external,
}: {
  label: string;
  href: string;
  external?: boolean;
}) {
  const spring = { type: "spring" as const, stiffness: 260, damping: 24 };
  return (
    <motion.a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={external ? `${label} — opens in a new tab` : label}
      className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-3xl border border-neutral-300/50 bg-neutral-300/50 p-6 shadow-lg shadow-black/5 backdrop-blur-lg hover:backdrop-blur-sm transition cursor-pointer md:min-h-[300px] md:p-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      whileHover={{ y: -6, transition: spring }}
      whileTap={{ scale: 0.99, transition: spring }}
    >
      {/* Arrow affordance — slides up-and-right on hover */}
      <span className="absolute right-6 top-6 text-neutral-700 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-neutral-950 md:right-8 md:top-8">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
          <path
            d="M7 17 17 7M9 7h8v8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">
        {label}
      </span>
    </motion.a>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden px-4 pb-10 pt-16 lg:px-8 lg:pt-24">
      {/* Background wordmark — huge, centred, clipped by the footer's
          overflow-hidden. Sits behind the frosted tiles, which blur the
          letters they cover; the gap between tiles reveals the crisp glyphs. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center"
      >
        <span className="select-none whitespace-nowrap text-[19vw] font-black leading-none tracking-tighter text-neutral-950">
          itskashyap
        </span>
      </div>

      {/* Frosted tiles */}
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
        <FooterTile href="mailto:kashyapjagwani@gmail.com" label="Contact" />
        <FooterTile
          href="https://www.linkedin.com/in/kashyap-jagwani"
          label="LinkedIn"
          external
        />
      </div>

      {/* Baseline — name + year, kept subtle so the wordmark stays the hero */}
      <div className="relative mt-10 flex items-center justify-between text-sm text-neutral-500">
        <span>© {new Date().getFullYear()} Kashyap Jagwani</span>
        <span className="uppercase tracking-widest">Mumbai</span>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="bg-[#f2ede8] min-h-screen font-sans overflow-x-hidden">
      {/* ── Fixed header ── */}
      {/* `mix-blend-difference` sits on the header itself — the fixed element
          that participates in the page's root stacking context — so the whole
          group (info text + Get in Touch button) inverts against whatever
          scrolls behind it. On a descendant the blend would be trapped inside
          the header's own stacking context and show no effect. */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-4 lg:px-8 pt-5 pb-4 mix-blend-difference"
        initial="hidden"
        animate="visible"
        variants={staggerHeader}
      >
        <div className="flex gap-10">
          <motion.div variants={fadeDown}>
            <InfoBlock
              label="Kashyap Jagwani"
              sub="📍Mumbai - I love this city ❤️"
            />
          </motion.div>
          {/* <motion.div variants={fadeDown}>
            <InfoBlock label="Looking for" sub="Full-time roles" />
          </motion.div>
          <motion.div variants={fadeDown}>
            <InfoBlock label="Available" sub="Immediately" />
          </motion.div> */}
        </div>

        <GetInTouchButton />
      </motion.header>

      {/* ── Hero ── */}
      {/* The top margin clears the fixed header; the height subtracts that same
          margin at each breakpoint so `margin + height` is always exactly one
          viewport — otherwise `h-screen + mt-*` overflows the fold by the margin.
          svh (small viewport height) is static — unlike dvh it doesn't
          recalculate as mobile browser chrome shows/hides on scroll, so the hero
          stays put instead of jumping mid-scroll. */}
      <main className="flex flex-col px-4 lg:px-8 h-[calc(100svh-4rem)] mt-16 md:h-[calc(100svh-8rem)] md:mt-32 xl:h-svh xl:mt-0">
        {/* Work-board collage — fills the space above the title */}
        <HeroCollage />

        <div className="flex flex-col gap-y-3">
          {/* Decorative corner labels */}
          <motion.div
            className="flex justify-between items-center pt-4 md:pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <span className="text-lg uppercase tracking-widest text-neutral-950 font-medium">
              MUSIC
            </span>
            <span className="text-lg uppercase tracking-widest text-neutral-950 font-medium">
              GAMING
            </span>
            <span className="text-lg uppercase tracking-widest text-neutral-950 font-medium">
              AND
            </span>
          </motion.div>

          {/* Bottom section */}
          <div className="pb-8">
            {/* Display title — clips during slide-up animation */}
            <div className="overflow-hidden">
              <motion.h1
                className="text-5xl md:text-[52px] lg:text-7xl xl:text-8xl 2xl:text-9xl font-black uppercase text-neutral-950 lg:whitespace-nowrap sm:text-center"
                style={{
                  lineHeight: 0.88,
                  letterSpacing: "-0.02em",
                }}
                initial={{ y: "106%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease, delay: 0.55 }}
              >
                FULL&nbsp;STACK DEVELOPMENT
              </motion.h1>
            </div>

            {/* Bottom bar: scroll hint · profile card · scroll hint */}
            <div className="flex items-center justify-between mt-5">
              <motion.span
                className="text-[13px] text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.25 }}
              >
                ↓ Scroll for
              </motion.span>

              {/* <ProfileCard /> */}

              <motion.span
                className="text-[13px] text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.25 }}
              >
                cool sh*t ↓
              </motion.span>
            </div>
          </div>
        </div>
      </main>

      {/* ── Myself ── */}
      <section className="px-4 lg:px-8 py-24 lg:py-36">
        <p className="text-lg uppercase tracking-widest text-neutral-950 font-medium mb-4">
          MYSELF
        </p>
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
          {/* Image — stacks on top full-width on tablet and below, right column on desktop */}
          <motion.div
            className="order-1 md:order-2 w-full md:w-[40%] shrink-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease }}
          >
            <figure className="m-0 flex flex-col gap-3">
              <Image
                src="/my-solo-trek.jpeg"
                alt="Me on my first solo camping trip at Mt. Rainier, Washington"
                width={576}
                height={500}
                sizes="(min-width: 1280px) 44vw, 100vw"
                className="h-fit w-full max-w-[480px] rounded-2xl"
              />
              <figcaption className="flex flex-col gap-0.5 max-w-[480px]">
                <span className="flex items-center gap-1.5 font-semibold tracking-wide text-neutral-500">
                  <span aria-hidden>📍</span>
                  Mt. Rainier, Washington
                </span>
                <span className="text-lg text-neutral-950">
                  My first solo camping trek, 2023.
                </span>
              </figcaption>
            </figure>
          </motion.div>

          {/* Text — below image on tablet and below, left column on desktop */}
          <motion.div
            className="order-2 md:order-1 flex flex-col gap-y-3 flex-1"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease, delay: 0.12 }}
          >
            <p
              className="text-4xl lg:text-5xl font-black text-neutral-950"
              style={{ lineHeight: 1.08, letterSpacing: "-0.02em" }}
            >
              Passionate about crafting great user experiences on web & mobile.
              I build responsive, cross-browser-compatible, and
              performance-optimized apps with a focus on writing clean code.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── My Tech Stack ── */}
      <section className="px-4 lg:px-8 pb-24">
        {/* Heading + reset. Scatter the letters with your cursor; hit Reset to
            snap them home (the only way back on touch, where there's no hover). */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <ScatterTitle
            text="MY TECH STACK"
            className="text-5xl md:text-[52px] lg:text-7xl xl:text-8xl font-black uppercase text-neutral-950"
          />
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-x-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.1 },
            },
          }}
        >
          {TECH_STACK.map(({ group, items }) => (
            <motion.div
              key={group}
              className="flex flex-col gap-4"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease },
                },
              }}
            >
              <span className="text-sm uppercase tracking-widest text-neutral-500 font-medium">
                {group}
              </span>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className="text-xl lg:text-2xl font-bold text-neutral-950"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Work '26 ── */}
      <section className="px-4 lg:px-8 pb-24">
        <div className="w-full flex flex-wrap items-baseline justify-self-start md:justify-between mb-6 gap-x-3 gap-y-2 text-5xl md:text-[52px] lg:text-7xl xl:text-8xl 2xl:text-9xl font-black uppercase text-neutral-950 lg:whitespace-nowrap sm:text-center">
          <ScatterTitle
            text="WORK"
            className="text-5xl md:text-[52px] lg:text-7xl xl:text-8xl font-black uppercase text-neutral-950"
          />
          <ScatterTitle
            text="'23-26"
            className="text-5xl md:text-[52px] lg:text-7xl xl:text-8xl font-black uppercase text-neutral-950"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <ProjectCard
            src="/work/goEasy/work-board.png"
            logoSrc="/work/goEasy/logo.png"
            alt="goEasy work board"
            project="goEasy"
            description="My first full-time job after graduation. Joined goEasy as an intern and currently a Web + Mobile Software Engineer. We are a team of five and I handle the entire frontend and mobile development of 3 apps"
            year="2023 — Present"
            skills={[
              "React.js",
              "Next.js",
              "Tailwind",
              "React Native",
              "TypeScript",
              "Vercel",
              "AWS",
              "GitHub",
              "Google Firebase",
            ]}
            index={0}
            href="https://apps.apple.com/us/app/goeasy-parent/id6751049315"
          />
          <ProjectCard
            src="/work/satej-oils/work-board.png"
            logoSrc="/work/satej-oils/logo.jpg"
            alt="Satej Oils overview"
            project="Satej Oils (Mumbai)"
            description="Freelanced for Satej Oils, a local organic cold-pressed oils brand in Mumbai. Worked upon revamping their website with a focus on smoother UX and a modern, clean aesthetic."
            year="2026"
            skills={[
              "React.js",
              "TypeScript",
              "Vite",
              "Contentful CMS",
              "Product Design",
              "UI",
              "UX",
              "Tailwind",
              "Wireframing",
            ]}
            index={1}
            href="https://satej-woodpressed-oils.edgeone.dev/"
          />
          <ProjectCard
            src="/work/salt-and-straw/work-board.png"
            logoSrc="/work/salt-and-straw/logo.png"
            alt="Salt & Straw overview"
            project="Salt & Straw (Seattle)"
            description="Final year UX design project at my university. The project was about designing a better digital experience for a local craft ice-cream brand in the city."
            year="2022 - 23"
            skills={[
              "Product Design",
              "UI",
              "UX",
              "Figma",
              "Wireframing",
              "Information Architecture",
              "Brand Strategy",
            ]}
            index={1}
            href="https://saltandstraw.com"
          />
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
