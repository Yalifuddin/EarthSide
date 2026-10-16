"use client";

import { motion } from "motion/react";
import { useId } from "react";

/*
 * A hand-drawn half globe, in the same line-art spirit as the logo.
 * Continents and clouds live on 1000px-wide tiles that are drawn twice and
 * slid left forever, which reads as a slowly spinning planet.
 */

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 520;
const CENTER_X = 500;
const CENTER_Y = 520;
const RADIUS = 480;

const CONTINENTS = [
  "M120 150 C170 110 260 120 280 170 C300 220 250 250 260 300 C270 350 320 380 300 430 C285 470 240 480 225 440 C210 400 190 360 160 330 C120 290 70 250 90 200 C100 170 105 160 120 150 Z",
  "M470 120 C520 100 590 110 600 150 C610 190 570 200 580 240 C595 290 640 320 620 380 C600 440 540 470 520 420 C505 380 520 340 490 310 C455 275 420 250 430 200 C438 160 445 135 470 120 Z",
  "M690 130 C760 90 880 100 930 150 C970 190 940 240 880 250 C830 258 800 290 750 280 C700 270 660 230 665 190 C668 160 672 145 690 130 Z",
  "M360 440 C375 415 420 410 440 430 C460 450 440 480 405 478 C370 476 350 460 360 440 Z",
];

/** A little archipelago — a nod to Indonesia. */
const ISLANDS = [
  { cx: 735, cy: 345, rx: 42, ry: 13, rotate: -12 },
  { cx: 805, cy: 362, rx: 30, ry: 11, rotate: 8 },
  { cx: 860, cy: 346, rx: 22, ry: 10, rotate: -20 },
  { cx: 905, cy: 378, rx: 36, ry: 12, rotate: 4 },
  { cx: 785, cy: 400, rx: 20, ry: 8, rotate: -6 },
];

const CLOUDS = [
  { cx: 180, cy: 230, rx: 90, ry: 18 },
  { cx: 420, cy: 170, rx: 70, ry: 14 },
  { cx: 640, cy: 300, rx: 110, ry: 20 },
  { cx: 880, cy: 210, rx: 80, ry: 15 },
];

const SPARKLES = [
  { x: 40, y: 120, size: 16, delay: 0 },
  { x: 950, y: 90, size: 22, delay: 0.8 },
  { x: 880, y: 20, size: 12, delay: 1.6 },
  { x: 110, y: 30, size: 12, delay: 2.2 },
  { x: 990, y: 300, size: 14, delay: 1.1 },
  { x: 10, y: 360, size: 18, delay: 2.7 },
];

function Sparkle({ x, y, size, delay }: (typeof SPARKLES)[number]) {
  const h = size / 2;
  return (
    <path
      d={`M${x} ${y - h} Q${x} ${y} ${x + h} ${y} Q${x} ${y} ${x} ${y + h} Q${x} ${y} ${x - h} ${y} Q${x} ${y} ${x} ${y - h} Z`}
      className="animate-twinkle fill-rose"
      style={{ animationDelay: `${delay}s`, transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

function ContinentTile({ offset }: { offset: number }) {
  return (
    <g transform={`translate(${offset} 0)`}>
      {CONTINENTS.map((d) => (
        <path
          key={d}
          d={d}
          className="fill-moss stroke-cream"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ))}
      {ISLANDS.map(({ cx, cy, rx, ry, rotate }) => (
        <ellipse
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          transform={`rotate(${rotate} ${cx} ${cy})`}
          className="fill-moss stroke-cream"
          strokeWidth={2.5}
        />
      ))}
    </g>
  );
}

function CloudTile({ offset }: { offset: number }) {
  return (
    <g transform={`translate(${offset} 0)`} className="fill-white/45">
      {CLOUDS.map((cloud) => (
        <ellipse key={`${cloud.cx}-${cloud.cy}`} {...cloud} />
      ))}
    </g>
  );
}

const spin = (seconds: number) => ({
  animate: { x: [0, -VIEW_WIDTH] },
  transition: { duration: seconds, ease: "linear" as const, repeat: Infinity },
});

export function HalfEarth({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const clip = `${id}-clip`;
  const ocean = `${id}-ocean`;
  const shade = `${id}-shade`;
  const glow = `${id}-glow`;
  const upperHalf = `${id}-upper`;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className={className}
      role="img"
      aria-hidden
      overflow="visible"
    >
      <defs>
        <clipPath id={clip}>
          <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} />
        </clipPath>
        <radialGradient id={ocean} cx="38%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#2a8a96" />
          <stop offset="45%" stopColor="#105666" />
          <stop offset="100%" stopColor="#0a3323" />
        </radialGradient>
        <radialGradient id={shade} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
          <stop offset="85%" stopColor="#0a3323" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0a3323" stopOpacity="0.6" />
        </radialGradient>
        {/* Everything below the horizon is cut off — it's a *half* earth. */}
        <clipPath id={upperHalf}>
          <rect x={-60} y={-120} width={VIEW_WIDTH + 120} height={CENTER_Y + 120} />
        </clipPath>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>

      <g clipPath={`url(#${upperHalf})`}>
        {/* Atmosphere */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={RADIUS + 18}
          className="fill-rose/45 transition-opacity duration-500 group-hover:opacity-100 opacity-70"
          filter={`url(#${glow})`}
        />

        <g clipPath={`url(#${clip})`}>
          <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill={`url(#${ocean})`} />
          <motion.g {...spin(80)}>
            <ContinentTile offset={0} />
            <ContinentTile offset={VIEW_WIDTH} />
          </motion.g>
          <motion.g {...spin(45)}>
            <CloudTile offset={0} />
            <CloudTile offset={VIEW_WIDTH} />
          </motion.g>
          <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill={`url(#${shade})`} />
        </g>

        {/* Hand-drawn rim, echoing the logo's globe outline */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={RADIUS}
          fill="none"
          className="stroke-forest"
          strokeWidth={5}
        />
        <path
          d={`M ${CENTER_X - RADIUS - 22} ${CENTER_Y} A ${RADIUS + 22} ${RADIUS + 22} 0 0 1 ${CENTER_X + RADIUS + 22} ${CENTER_Y}`}
          fill="none"
          className="stroke-forest/30"
          strokeWidth={2}
          strokeDasharray="2 14"
          strokeLinecap="round"
        />
      </g>

      {/* Horizon the globe rests on */}
      <line
        x1={CENTER_X - RADIUS - 40}
        y1={CENTER_Y - 2}
        x2={CENTER_X + RADIUS + 40}
        y2={CENTER_Y - 2}
        className="stroke-forest"
        strokeWidth={5}
        strokeLinecap="round"
      />

      {SPARKLES.map((sparkle) => (
        <Sparkle key={`${sparkle.x}-${sparkle.y}`} {...sparkle} />
      ))}
    </svg>
  );
}
