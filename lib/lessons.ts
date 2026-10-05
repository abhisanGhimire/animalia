import type { BodyPlan } from "./types";

// Drawing lessons are built from simple shapes, so ONE lesson template serves
// every animal with the same body plan. Each step teaches what to LOOK for
// (proportions, where parts attach), not just what to copy.

export type Shape =
  | { t: "ellipse"; cx: number; cy: number; rx: number; ry: number; rot?: number }
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "path"; d: string }
  | { t: "dot"; cx: number; cy: number; r: number };

export interface Step {
  title: string;
  kid: string;
  look: string; // the observation tip
  shapes: Shape[];
}

const QUAD: Step[] = [
  { title: "Big body oval", kid: "Draw a big egg-shaped oval for the body, lying on its side.", look: "Start with the biggest shape. Most of an animal's weight is in the body, so get its size and tilt right first.", shapes: [{ t: "ellipse", cx: 140, cy: 105, rx: 72, ry: 38 }] },
  { title: "Head circle", kid: "Add a smaller circle for the head at one end.", look: "Compare the head to the body: here the head is roughly one third of the body's length. Measure with your pencil held at arm's length.", shapes: [{ t: "circle", cx: 238, cy: 75, r: 28 }] },
  { title: "Neck and leg guides", kid: "Join head and body with two curved lines. Add four straight lines down for legs.", look: "Notice where the legs attach: they sit beneath the body, not at the very ends. The front legs are right behind the head's side.", shapes: [{ t: "path", d: "M214 66 Q196 78 200 100 M222 96 Q214 112 206 118" }, { t: "path", d: "M110 135 L108 175 M165 138 L166 175 M95 130 L90 175 M180 135 L184 175" }] },
  { title: "Shape the legs", kid: "Turn each line into a leg with a bend and a paw.", look: "Legs have joints: a bend about halfway down. Front and back legs bend in opposite directions.", shapes: [{ t: "path", d: "M100 130 Q96 155 100 175 L116 175 Q116 150 120 135 M156 138 Q156 158 156 175 L174 175 Q174 155 178 138" }] },
  { title: "Face map", kid: "Add two eyes, a nose and two ears.", look: "The eye sits about halfway between the nose and the back of the skull. The ears sit near the top of the head.", shapes: [{ t: "dot", cx: 246, cy: 70, r: 3.5 }, { t: "dot", cx: 262, cy: 80, r: 4 }, { t: "path", d: "M225 52 L220 36 L236 46 Z" }] },
  { title: "Tail", kid: "Add a tail at the back of the body.", look: "Follow the line of the spine. The tail is a continuation of it, so it starts where the back ends.", shapes: [{ t: "path", d: "M70 98 Q40 90 34 62" }] },
  { title: "Details and texture", kid: "Add fur marks, whiskers or spots.", look: "Details follow the form. Make marks curve around the body to show it is round, not flat.", shapes: [{ t: "path", d: "M115 90 q8 10 0 20 M140 85 q8 10 0 22 M165 90 q8 10 0 20 M262 84 l16 -3 M262 88 l16 3" }] },
  { title: "Shade and finish", kid: "Press a bit harder under the belly and legs. Done!", look: "Light comes from one side. Shade the opposite side and underneath. Darker shade = further from the light.", shapes: [{ t: "path", d: "M95 128 Q140 150 190 128" }] },
];

const BIRD: Step[] = [
  { title: "Body oval", kid: "Draw a tilted egg shape for the body.", look: "A bird's body is like a teardrop: fat at the chest, thin at the tail. Tilt it a little upward.", shapes: [{ t: "ellipse", cx: 150, cy: 110, rx: 60, ry: 40, rot: -20 }] },
  { title: "Head circle", kid: "Add a small circle for the head.", look: "Birds have small heads for their bodies. Here it is about one third of the body's width.", shapes: [{ t: "circle", cx: 218, cy: 62, r: 24 }] },
  { title: "Beak", kid: "Add a triangle beak.", look: "Look at the beak's length against the head. It starts at the front of the face, level with the eye.", shapes: [{ t: "path", d: "M238 58 L274 66 L238 74 Z" }] },
  { title: "Wing", kid: "Draw a leaf shape on the side for the wing.", look: "The wing attaches at the shoulder, near the top of the body, and points back along the body.", shapes: [{ t: "path", d: "M150 90 Q110 80 76 126 Q130 130 160 108 Z" }] },
  { title: "Tail", kid: "Add long feathers at the back.", look: "The tail continues the line of the back. Count the feathers you see and draw that many.", shapes: [{ t: "path", d: "M100 128 L52 160 M96 120 L44 140 M108 134 L70 172" }] },
  { title: "Legs and feet", kid: "Add two thin legs with toes.", look: "Bird legs sit near the middle of the body so it can balance. The visible 'knee' bends backwards - it is really the ankle.", shapes: [{ t: "path", d: "M146 148 L142 186 M142 186 l-12 4 M142 186 l12 4 M166 146 L166 186 M166 186 l-10 4 M166 186 l12 4" }] },
  { title: "Eye and feather lines", kid: "Add an eye and feather marks.", look: "Feathers overlap like roof tiles, pointing back toward the tail.", shapes: [{ t: "dot", cx: 222, cy: 58, r: 3.5 }, { t: "path", d: "M170 100 q6 6 0 14 M185 96 q6 6 0 14 M120 100 q6 6 0 14" }] },
  { title: "Shade and finish", kid: "Shade under the belly and wing. Done!", look: "Shade under the wing and belly where light does not reach.", shapes: [{ t: "path", d: "M118 140 Q150 156 190 140" }] },
];

const FISH: Step[] = [
  { title: "Body oval", kid: "Draw a long oval for the body.", look: "Fish bodies are streamlined: smooth and pointed at both ends so they slip through water.", shapes: [{ t: "ellipse", cx: 150, cy: 100, rx: 80, ry: 40 }] },
  { title: "Tail", kid: "Add a triangle for the tail at the back.", look: "The tail fin attaches to the narrow 'wrist' at the back end of the body.", shapes: [{ t: "path", d: "M72 100 L24 64 L36 100 L24 136 Z" }] },
  { title: "Top and bottom fins", kid: "Add fins on top and underneath.", look: "Notice where the top fin sits: roughly in the middle of the back.", shapes: [{ t: "path", d: "M130 62 Q150 28 182 66 M140 138 Q150 164 172 138" }] },
  { title: "Side fin", kid: "Add a small fin on the side.", look: "The pectoral fin sits just behind the gill, low on the side.", shapes: [{ t: "path", d: "M190 108 Q170 134 182 132 Q198 124 200 112 Z" }] },
  { title: "Eye and mouth", kid: "Add a big round eye and a mouth.", look: "The eye is near the front, above the mouth line. Fish eyes are on the sides of the head.", shapes: [{ t: "circle", cx: 206, cy: 90, r: 8 }, { t: "dot", cx: 206, cy: 90, r: 3 }, { t: "path", d: "M228 104 Q236 108 228 112" }] },
  { title: "Gill line", kid: "Draw a curved line behind the eye.", look: "The gill cover is a curved line that marks where the head ends and the body begins.", shapes: [{ t: "path", d: "M186 72 Q176 100 186 128" }] },
  { title: "Scales and stripes", kid: "Add scale marks or stripes.", look: "Scales overlap in rows. Draw the pattern curved so it wraps around the body.", shapes: [{ t: "path", d: "M110 84 q8 8 0 16 M126 80 q8 10 0 20 M142 80 q8 10 0 20 M158 84 q8 8 0 16" }] },
  { title: "Shade and finish", kid: "Shade the back darker and the belly lighter. Done!", look: "Many fish are darker on top and lighter underneath. Copy that pattern with your shading.", shapes: [{ t: "path", d: "M90 72 Q150 54 200 74" }] },
];

export function lessonFor(plan: BodyPlan): Step[] | null {
  if (plan === "quadruped") return QUAD;
  if (plan === "bird") return BIRD;
  if (plan === "fish") return FISH;
  return null;
}
