// popup/layout.js
function pickRingPositions(count, containerSize, nodeSize) {
  if (count <= 0) return [];

  const center = containerSize / 2;
  const radius = (containerSize - nodeSize) / 2;
  const positions = [];

  for (let i = 0; i < count; i++) {
    const angle = (-90 + (360 / count) * i) * (Math.PI / 180);
    const cx = center + radius * Math.cos(angle);
    const cy = center + radius * Math.sin(angle);
    positions.push({ top: cy - nodeSize / 2, left: cx - nodeSize / 2 });
  }

  return positions;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { pickRingPositions };
}
