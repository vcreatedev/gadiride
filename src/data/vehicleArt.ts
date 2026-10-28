/**
 * Vehicle art used by the animation rigs and the line-drawing story.
 *
 * Coordinates are in centimetres, so every vehicle shares one true scale.
 * These are hand-built SVG stand-ins. To use real photography, add `png`
 * (transparent side-profile body + one wheel image) and keep `wheels`
 * matched to the photo's wheel centres. See README "Replacing vehicle art".
 */
export type Tone = "main" | "alt" | "dark";
export type Wheel = { cx: number; cy: number; r: number };
export type Arm = { id: string; pivot: [number, number]; paths: { d: string; tone: Tone }[] };
export type Light = { x: number; y: number; w: number; h: number; kind: "head" | "tail" };

export type VehicleArt = {
  id: ArtId;
  viewBox: [number, number, number, number];
  groundY: number;
  body: { d: string; tone: Tone }[];
  glass: string[];
  details: string[];
  lights: Light[];
  wheels: Wheel[];
  arms?: Arm[];
  /** Optional photo rig. Paths are relative to /public. */
  png?: { body: string; wheel: string };
  /** Driving character used by the rig. */
  feel: { accel: number; roll: number };
};

export type ArtId = "hatch" | "sedan" | "suv" | "van" | "bus" | "pickup" | "truck" | "jcb";

const busWindows = Array.from({ length: 6 }, (_, i) => {
  const x = 40 + i * 144;
  return `M${x},48 L${x + 130},48 L${x + 130},150 L${x},150 Z`;
});

export const ART: Record<ArtId, VehicleArt> = {
  hatch: {
    id: "hatch",
    viewBox: [0, 0, 410, 166],
    groundY: 162,
    body: [{ tone: "main", d: "M16,142 L14,66 Q16,26 52,20 L246,18 Q266,19 280,32 L316,70 L370,80 Q392,86 394,108 L394,142 Q394,148 388,148 L22,148 Q16,148 16,142 Z" }],
    glass: ["M36,66 L40,38 Q42,30 54,30 L240,29 Q254,29 262,38 L294,68 Z"],
    details: ["M150,30 L150,140", "M298,72 Q300,110 296,140", "M20,98 L392,102"],
    lights: [
      { x: 14, y: 70, w: 9, h: 22, kind: "tail" },
      { x: 380, y: 88, w: 14, h: 10, kind: "head" },
    ],
    wheels: [{ cx: 78, cy: 131, r: 31 }, { cx: 312, cy: 131, r: 31 }],
    feel: { accel: 1, roll: 1 },
  },
  sedan: {
    id: "sedan",
    viewBox: [0, 0, 490, 160],
    groundY: 156,
    body: [{ tone: "main", d: "M14,132 L12,96 Q14,80 40,76 L100,70 Q140,30 190,20 L300,18 Q336,20 358,44 L384,70 L450,78 Q478,84 480,104 L480,132 Q480,140 472,140 L22,140 Q14,140 14,132 Z" }],
    glass: ["M110,70 Q146,36 192,30 L298,29 Q326,30 344,48 L366,70 Z"],
    details: ["M232,30 L232,138", "M366,72 Q368,108 364,138", "M18,92 L478,96"],
    lights: [
      { x: 13, y: 82, w: 10, h: 12, kind: "tail" },
      { x: 465, y: 86, w: 15, h: 10, kind: "head" },
    ],
    wheels: [{ cx: 92, cy: 124, r: 32 }, { cx: 372, cy: 124, r: 32 }],
    feel: { accel: 1.1, roll: 0.8 },
  },
  suv: {
    id: "suv",
    viewBox: [0, 0, 490, 190],
    groundY: 186,
    body: [
      { tone: "main", d: "M14,160 L12,50 Q14,20 50,16 L330,14 Q352,15 364,30 L392,76 L456,86 Q480,92 480,116 L480,160 Q480,168 472,168 L22,168 Q14,168 14,160 Z" },
      { tone: "dark", d: "M60,12 L320,10 L320,15 L60,17 Z" },
    ],
    glass: ["M40,72 L42,34 Q44,26 56,26 L326,25 Q342,25 350,36 L372,74 Z"],
    details: ["M200,26 L200,166", "M374,80 Q376,124 372,166", "M16,98 L478,102"],
    lights: [
      { x: 13, y: 58, w: 10, h: 30, kind: "tail" },
      { x: 464, y: 96, w: 16, h: 12, kind: "head" },
    ],
    wheels: [{ cx: 92, cy: 148, r: 38 }, { cx: 380, cy: 148, r: 38 }],
    feel: { accel: 0.95, roll: 1.2 },
  },
  van: {
    id: "van",
    viewBox: [0, 0, 670, 270],
    groundY: 266,
    body: [{ tone: "main", d: "M14,240 L12,30 Q14,12 36,12 L540,10 Q570,10 586,30 L640,140 Q656,150 656,176 L656,240 Q656,248 648,248 L22,248 Q14,248 14,240 Z" }],
    glass: [
      "M40,50 L180,50 L180,112 L40,112 Z",
      "M196,50 L336,50 L336,112 L196,112 Z",
      "M352,50 L500,50 L500,112 L352,112 Z",
      "M524,40 Q560,38 574,56 L620,140 L524,140 Z",
    ],
    details: ["M512,30 L512,244", "M346,120 L346,244", "M16,160 L652,162"],
    lights: [
      { x: 13, y: 130, w: 10, h: 40, kind: "tail" },
      { x: 640, y: 160, w: 16, h: 14, kind: "head" },
    ],
    wheels: [{ cx: 130, cy: 228, r: 38 }, { cx: 520, cy: 228, r: 38 }],
    feel: { accel: 0.75, roll: 1.4 },
  },
  bus: {
    id: "bus",
    viewBox: [0, 0, 1120, 330],
    groundY: 326,
    body: [
      { tone: "main", d: "M14,300 L12,30 Q14,12 40,12 L1060,12 Q1096,12 1100,46 L1106,300 Q1106,308 1098,308 L22,308 Q14,308 14,300 Z" },
      { tone: "alt", d: "M14,212 L1106,212 L1106,232 L14,232 Z" },
    ],
    glass: [...busWindows, "M914,48 L984,48 L984,292 L914,292 Z", "M1000,48 L1090,48 Q1098,48 1099,60 L1102,200 L1000,200 Z"],
    details: ["M14,170 L1104,170", "M949,48 L949,292"],
    lights: [
      { x: 13, y: 240, w: 10, h: 40, kind: "tail" },
      { x: 1090, y: 244, w: 16, h: 20, kind: "head" },
    ],
    wheels: [{ cx: 240, cy: 276, r: 50 }, { cx: 880, cy: 276, r: 50 }],
    feel: { accel: 0.55, roll: 1.6 },
  },
  pickup: {
    id: "pickup",
    viewBox: [0, 0, 540, 196],
    groundY: 192,
    body: [{ tone: "main", d: "M14,166 L12,84 L250,84 L252,30 Q254,18 270,18 L370,18 Q392,18 404,34 L432,82 L500,92 Q526,98 526,122 L526,166 Q526,174 518,174 L22,174 Q14,174 14,166 Z" }],
    glass: ["M270,80 L272,32 Q274,28 282,28 L366,28 Q382,28 390,40 L414,80 Z"],
    details: ["M330,24 L330,170", "M250,84 L250,172", "M16,112 L524,114"],
    lights: [
      { x: 13, y: 90, w: 10, h: 26, kind: "tail" },
      { x: 510, y: 102, w: 16, h: 12, kind: "head" },
    ],
    wheels: [{ cx: 100, cy: 154, r: 38 }, { cx: 420, cy: 154, r: 38 }],
    feel: { accel: 0.85, roll: 1.2 },
  },
  truck: {
    id: "truck",
    viewBox: [0, 0, 820, 346],
    groundY: 342,
    body: [
      { tone: "alt", d: "M14,280 L14,22 Q14,10 26,10 L560,10 L560,280 Z" },
      { tone: "dark", d: "M14,268 L806,268 L806,292 L14,292 Z" },
      { tone: "main", d: "M572,300 L572,90 Q572,72 590,72 L720,72 Q746,72 758,96 L800,190 Q806,200 806,214 L806,300 Q806,308 798,308 L580,308 Q572,308 572,300 Z" },
    ],
    glass: ["M690,86 Q712,86 722,104 L766,190 L690,190 Z", "M598,90 L670,90 L670,170 L598,170 Z"],
    details: ["M150,12 L150,278", "M290,12 L290,278", "M430,12 L430,278", "M680,80 L680,300", "M14,240 L560,240"],
    lights: [
      { x: 13, y: 238, w: 10, h: 26, kind: "tail" },
      { x: 790, y: 228, w: 16, h: 18, kind: "head" },
    ],
    wheels: [{ cx: 130, cy: 294, r: 48 }, { cx: 250, cy: 294, r: 48 }, { cx: 700, cy: 294, r: 48 }],
    feel: { accel: 0.5, roll: 1.7 },
  },
  jcb: {
    id: "jcb",
    viewBox: [-40, 0, 760, 380],
    groundY: 372,
    body: [
      { tone: "dark", d: "M100,300 L100,236 L530,236 L552,272 L552,300 Z" },
      { tone: "main", d: "M170,238 L182,62 Q184,44 200,44 L302,44 Q318,44 320,62 L332,238 Z" },
      { tone: "dark", d: "M160,44 L340,44 L340,32 L160,32 Z" },
      { tone: "main", d: "M332,238 L332,166 L500,174 Q522,176 524,196 L524,238 Z" },
      { tone: "dark", d: "M468,174 L468,118 L482,118 L482,174 Z" },
    ],
    glass: ["M198,70 L304,70 L314,206 L190,206 Z"],
    details: ["M332,204 L524,206", "M252,70 L254,206"],
    lights: [
      { x: 510, y: 182, w: 14, h: 10, kind: "head" },
      { x: 300, y: 22, w: 16, h: 10, kind: "head" },
    ],
    wheels: [{ cx: 170, cy: 302, r: 70 }, { cx: 470, cy: 322, r: 50 }],
    arms: [
      {
        id: "loader",
        pivot: [330, 192],
        paths: [
          { tone: "main", d: "M318,184 L610,248 L606,270 L318,206 Z" },
          { tone: "dark", d: "M594,236 L676,244 Q700,280 702,334 L622,340 Q604,300 594,236 Z" },
        ],
      },
      {
        id: "backhoe",
        pivot: [104, 238],
        paths: [
          { tone: "main", d: "M110,246 L30,96 Q24,82 38,76 L54,72 L124,226 Z" },
          { tone: "main", d: "M36,80 L-6,226 L12,234 L58,92 Z" },
          { tone: "dark", d: "M-8,222 L-34,262 L-4,280 L22,240 Z" },
        ],
      },
    ],
    feel: { accel: 0.45, roll: 1.4 },
  },
};
