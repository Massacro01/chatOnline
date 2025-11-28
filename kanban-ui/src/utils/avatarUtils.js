// Utility to compute a deterministic, well-distributed color from a string (name)
// We generate an HSL color from a simple hash and convert to hex so shades vary across the hue wheel.
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash | 0;
  }
  return Math.abs(hash);
}

function hslToHex(h, s, l) {
  // h: 0-360, s:0-100, l:0-100
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const val = l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
    return Math.round(255 * val).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getAvatarColor(name) {
  if (!name) return '#6BCB77';
  const hash = simpleHash(name.toString());
  // Spread across full hue range for variety
  const hue = hash % 360;
  const saturation = 62; // pleasant saturated color
  const lightness = 52; // medium lightness for contrast with white text
  return hslToHex(hue, saturation, lightness);
}

export function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export default { getAvatarColor, getInitial };
