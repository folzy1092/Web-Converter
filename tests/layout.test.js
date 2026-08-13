// tests/layout.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickRingPositions } = require('../popup/layout.js');

test('returns exactly `count` positions', () => {
  assert.equal(pickRingPositions(5, 380, 76).length, 5);
  assert.equal(pickRingPositions(1, 380, 76).length, 1);
  assert.equal(pickRingPositions(0, 380, 76).length, 0);
});

test('every position keeps the node fully inside the container', () => {
  const positions = pickRingPositions(6, 380, 76);
  for (const { top, left } of positions) {
    assert.ok(top >= 0 && top + 76 <= 380, `top ${top} out of bounds`);
    assert.ok(left >= 0 && left + 76 <= 380, `left ${left} out of bounds`);
  }
});

test('positions are evenly spaced around the center (equal distance from center)', () => {
  const containerSize = 380;
  const nodeSize = 76;
  const center = containerSize / 2;
  const positions = pickRingPositions(4, containerSize, nodeSize);
  const distances = positions.map(({ top, left }) => {
    const cx = left + nodeSize / 2;
    const cy = top + nodeSize / 2;
    return Math.hypot(cx - center, cy - center);
  });
  for (const d of distances) {
    assert.ok(Math.abs(d - distances[0]) < 0.01, 'distances from center should match');
  }
});
