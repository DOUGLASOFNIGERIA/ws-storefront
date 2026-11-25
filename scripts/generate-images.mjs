import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "products");
mkdirSync(OUT, { recursive: true });

const palettes = {
  "onyx-chronograph": { bg: "#120d0a", main: "#1c1a19", accent: "#d9b26a", dial: "#0b0b0b" },
  "sapphire-automatic": { bg: "#0b1220", main: "#c8d2dc", accent: "#7fa6d8", dial: "#16305a" },
  "heritage-leather": { bg: "#1b120c", main: "#7c4a2d", accent: "#e5d2ae", dial: "#efe4cd" },
  "matrix-steel": { bg: "#101113", main: "#b8bec6", accent: "#8c949e", dial: "#2b3036" },
  "studio-tee": { bg: "#0d0d0d", main: "#171717", accent: "#f5efe4", dial: "#171717" },
  "crown-oversized-tee": { bg: "#d8ccb6", main: "#efe7d6", accent: "#b28a3c", dial: "#efe7d6" },
  "midnight-lagos-hoodie": { bg: "#0a0a12", main: "#151520", accent: "#d9b26a", dial: "#151520" },
  "everyday-tank": { bg: "#111010", main: "#1d1c1c", accent: "#f5efe4", dial: "#1d1c1c" },
  "oud-no-01": { bg: "#1a0f08", main: "#8c4a1c", accent: "#e0a55c", dial: "#f2dfc2" },
  "lagos-nights": { bg: "#070d1c", main: "#12305a", accent: "#6f9dd6", dial: "#dfe8f5" },
  "white-oud": { bg: "#d9d3c6", main: "#f2eee4", accent: "#b8a88c", dial: "#f7f4ec" },
  "signature-blend": { bg: "#1c0710", main: "#5b1024", accent: "#d9b26a", dial: "#f0e2d5" },
};

function wrap(bg, content, mark) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.42" r="0.55"><stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="800" height="1000" fill="url(#bg)"/><rect width="800" height="1000" fill="url(#glow)"/>
${content}
<text x="52" y="930" fill="#ffffff" fill-opacity="0.45" font-family="Arial, sans-serif" font-size="20" letter-spacing="8">WS</text>
<text x="52" y="962" fill="#ffffff" fill-opacity="0.3" font-family="Arial, sans-serif" font-size="12" letter-spacing="3">${mark}</text>
</svg>`;
}

function watchBody(p, back) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI) / 6;
    const x1 = 400 + Math.sin(angle) * 128;
    const y1 = 500 - Math.cos(angle) * 128;
    const x2 = 400 + Math.sin(angle) * 145;
    const y2 = 500 - Math.cos(angle) * 145;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${p.accent}" stroke-width="${i % 3 === 0 ? 9 : 4}" stroke-linecap="round"/>`;
  }).join("");

  if (back) {
    return `<rect x="332" y="90" width="136" height="820" rx="24" fill="${p.main}"/>
<rect x="352" y="90" width="96" height="820" rx="16" fill="#000" fill-opacity="0.18"/>
<circle cx="400" cy="500" r="196" fill="${p.main}" stroke="${p.accent}" stroke-opacity="0.5" stroke-width="8"/>
<circle cx="400" cy="500" r="164" fill="${p.bg}" stroke="${p.accent}" stroke-opacity="0.35" stroke-width="3"/>
<circle cx="400" cy="500" r="92" fill="${p.main}" stroke="${p.accent}" stroke-opacity="0.6" stroke-width="4"/>
<text x="400" y="492" text-anchor="middle" fill="${p.accent}" font-family="Arial, sans-serif" font-size="54" font-weight="bold" letter-spacing="4">WS</text>
<text x="400" y="530" text-anchor="middle" fill="${p.accent}" fill-opacity="0.8" font-family="Arial, sans-serif" font-size="15" letter-spacing="3">STEEL BACK</text>
<text x="400" y="640" text-anchor="middle" fill="${p.accent}" fill-opacity="0.7" font-family="Arial, sans-serif" font-size="13" letter-spacing="4">N° ${p.bg.slice(1, 4).toUpperCase()}</text>
${[0, 90, 180, 270].map((a) => { const x = 400 + Math.cos((a * Math.PI) / 180) * 178; const y = 500 + Math.sin((a * Math.PI) / 180) * 178; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${p.bg}" stroke="${p.accent}" stroke-opacity="0.5" stroke-width="2"/>`; }).join("")}`;
  }

  return `<rect x="332" y="90" width="136" height="820" rx="24" fill="${p.main}"/>
<rect x="352" y="90" width="96" height="820" rx="16" fill="#000" fill-opacity="0.18"/>
<circle cx="400" cy="500" r="196" fill="${p.main}" stroke="${p.accent}" stroke-width="8"/>
<circle cx="400" cy="500" r="170" fill="${p.dial}" stroke="#000" stroke-opacity="0.4" stroke-width="4"/>
${ticks}
<circle cx="340" cy="500" r="34" fill="none" stroke="${p.accent}" stroke-opacity="0.55" stroke-width="3"/>
<circle cx="460" cy="500" r="34" fill="none" stroke="${p.accent}" stroke-opacity="0.55" stroke-width="3"/>
<text x="400" y="430" text-anchor="middle" fill="${p.accent}" font-family="Arial, sans-serif" font-size="40" font-weight="bold" letter-spacing="4">WS</text>
<line x1="400" y1="500" x2="400" y2="390" stroke="${p.accent}" stroke-width="10" stroke-linecap="round"/>
<line x1="400" y1="500" x2="482" y2="540" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/>
<circle cx="400" cy="500" r="12" fill="${p.accent}"/>
<text x="400" y="585" text-anchor="middle" fill="${p.accent}" fill-opacity="0.8" font-family="Arial, sans-serif" font-size="14" letter-spacing="4">AUTOMATIC</text>`;
}

function shirtPath(kind, p) {
  if (kind === "tank") {
    return `<path d="M300 205 L360 175 Q400 225 440 175 L500 205 L530 310 L490 330 L480 790 Q400 815 320 790 L310 330 L270 310 Z" fill="${p.main}" stroke="#000" stroke-opacity="0.35" stroke-width="4"/>
<path d="M360 175 Q400 225 440 175" fill="none" stroke="${p.accent}" stroke-opacity="0.45" stroke-width="5"/>`;
  }
  if (kind === "hoodie") {
    return `<path d="M275 210 L350 165 Q400 205 450 165 L525 210 L635 310 L555 385 L525 340 L525 800 Q400 830 275 800 L275 340 L245 385 L165 310 Z" fill="${p.main}" stroke="#000" stroke-opacity="0.35" stroke-width="4"/>
<path d="M330 165 Q400 90 470 165 Q400 230 330 165 Z" fill="${p.bg}" stroke="${p.accent}" stroke-opacity="0.35" stroke-width="4"/>
<line x1="365" y1="205" x2="355" y2="330" stroke="${p.accent}" stroke-width="5"/>
<line x1="435" y1="205" x2="445" y2="330" stroke="${p.accent}" stroke-width="5"/>
<rect x="320" y="610" width="160" height="100" rx="12" fill="#000" fill-opacity="0.16"/>`;
  }
  return `<path d="M280 205 L350 170 Q400 215 450 170 L520 205 L625 305 L550 380 L520 335 L520 790 Q400 820 280 790 L280 335 L250 380 L175 305 Z" fill="${p.main}" stroke="#000" stroke-opacity="0.35" stroke-width="4"/>
<path d="M350 170 Q400 215 450 170" fill="none" stroke="${p.accent}" stroke-opacity="0.45" stroke-width="5"/>`;
}

function clothingBody(slug, p, back) {
  const kind = slug.includes("hoodie") ? "hoodie" : slug.includes("tank") ? "tank" : "tee";
  const base = shirtPath(kind, p);
  if (back) {
    return `${base}
<text x="400" y="420" text-anchor="middle" fill="${p.accent}" font-family="Georgia, serif" font-size="62" font-style="italic">Lagos</text>
<text x="400" y="470" text-anchor="middle" fill="${p.accent}" fill-opacity="0.7" font-family="Arial, sans-serif" font-size="18" letter-spacing="10">WS / LAGOS</text>
<line x1="300" y1="720" x2="500" y2="720" stroke="${p.accent}" stroke-opacity="0.35" stroke-width="3"/>`;
  }
  const chest = slug.includes("crown")
    ? `<path d="M350 390 L370 350 L390 375 L400 335 L410 375 L430 350 L450 390 Z" fill="${p.accent}"/><text x="400" y="445" text-anchor="middle" fill="${p.accent}" font-family="Arial, sans-serif" font-size="22" letter-spacing="8">CROWN</text>`
    : `<text x="400" y="420" text-anchor="middle" fill="${p.accent}" font-family="Arial Black, Arial, sans-serif" font-size="86" font-weight="bold" letter-spacing="-4">WS</text><text x="400" y="458" text-anchor="middle" fill="${p.accent}" fill-opacity="0.85" font-family="Arial, sans-serif" font-size="16" letter-spacing="5">EST. LAGOS</text>`;
  return `${base}${chest}`;
}

function perfumeBody(slug, p, back) {
  const lines = [
    "EXTRAIT DE PARFUM",
    "100ML / 3.4 FL OZ",
    "MADE IN LAGOS",
  ];
  return `<ellipse cx="400" cy="815" rx="170" ry="26" fill="#000" fill-opacity="0.35"/>
<rect x="352" y="165" width="96" height="130" rx="12" fill="${p.accent}"/>
<rect x="368" y="285" width="64" height="34" fill="${p.main}"/>
<rect x="255" y="310" width="290" height="470" rx="34" fill="${p.main}" stroke="${p.accent}" stroke-opacity="0.6" stroke-width="5"/>
<rect x="275" y="330" width="250" height="430" rx="24" fill="url(#bg)" fill-opacity="0.25"/>
<rect x="305" y="420" width="190" height="210" rx="6" fill="${p.dial}"/>
<text x="400" y="495" text-anchor="middle" fill="${p.bg}" font-family="Arial Black, Arial, sans-serif" font-size="62" font-weight="bold">WS</text>
<text x="400" y="540" text-anchor="middle" fill="${p.bg}" font-family="Georgia, serif" font-size="26" font-style="italic">${slug.replace(/-/g, " ").toUpperCase()}</text>
<line x1="335" y1="565" x2="465" y2="565" stroke="${p.bg}" stroke-opacity="0.4" stroke-width="2"/>
${back ? lines.map((line, i) => `<text x="400" y="${600 + i * 24}" text-anchor="middle" fill="${p.bg}" fill-opacity="0.75" font-family="Arial, sans-serif" font-size="11" letter-spacing="2">${line}</text>`).join("") : `<text x="400" y="605" text-anchor="middle" fill="${p.bg}" fill-opacity="0.7" font-family="Arial, sans-serif" font-size="13" letter-spacing="3">WS PARFUMS</text>`}`;
}

const names = Object.keys(palettes);
for (const slug of names) {
  const palette = palettes[slug];
  const category = slug.startsWith("ws-") || slug.includes("tee") || slug.includes("hoodie") || slug.includes("tank") ? "clothing" : slug.includes("oud") || slug.includes("lagos") || slug.includes("signature") ? "perfume" : "watches";
  const render = (back) => {
    if (category === "watches") return watchBody(palette, back);
    if (category === "perfume") return perfumeBody(slug, palette, back);
    return clothingBody(slug, palette, back);
  };
  writeFileSync(path.join(OUT, `${slug}-front.svg`), wrap(palette.bg, render(false), `${slug} / front`));
  writeFileSync(path.join(OUT, `${slug}-back.svg`), wrap(palette.bg, render(true), `${slug} / back`));
}

console.log(`Generated ${names.length * 2} product images in ${OUT}`);
