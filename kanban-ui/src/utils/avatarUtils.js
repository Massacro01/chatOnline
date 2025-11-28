// Simple utility to compute a deterministic color from a string (name)
const COLORS = [
  '#FF6B6B',
  '#F7B267',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#845EC2',
  '#FF8066',
  '#00C9A7',
  '#FF9F1C',
  '#2EC4B6'
];

export function getAvatarColor(name) {
  if (!name) return COLORS[0];
  // Simple hash based on char codes
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export default { getAvatarColor, getInitial };
