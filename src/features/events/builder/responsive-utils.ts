const DESIGN_WIDTH = 1200;
const PHONE_MAX = 480;

export function responsiveSize(value: number, canvasWidth: number, min = 12): number {
  if (canvasWidth >= DESIGN_WIDTH) return value;
  const ratio = canvasWidth / DESIGN_WIDTH;
  const scaled = Math.round(value * Math.sqrt(ratio));
  return Math.max(min, Math.min(value, scaled));
}

export function isPhone(canvasWidth: number): boolean {
  return canvasWidth <= PHONE_MAX;
}
