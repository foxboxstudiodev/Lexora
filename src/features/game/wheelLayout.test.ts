import { describe, expect, it } from 'vitest';
import { createCircularWheelLayout, createPolylinePoints } from './wheelLayout';

describe('wheel layout', () => {
  it('creates one circular point per letter', () => {
    const points = createCircularWheelLayout(6);
    expect(points).toHaveLength(6);
  });

  it('places points inside a 0-100 viewBox', () => {
    const points = createCircularWheelLayout(8);
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(100);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(100);
    }
  });

  it('starts at the top of the circle', () => {
    const [first] = createCircularWheelLayout(5);
    expect(first.x).toBeCloseTo(50, 2);
    expect(first.y).toBeLessThan(25);
  });

  it('returns an empty layout for empty wheels', () => {
    expect(createCircularWheelLayout(0)).toEqual([]);
  });

  it('creates polyline points from selected indexes', () => {
    const points = createCircularWheelLayout(4);
    const polyline = createPolylinePoints([0, 2], points);
    expect(polyline.split(' ')).toHaveLength(2);
    expect(polyline).toContain(',');
  });

  it('ignores indexes outside the wheel', () => {
    const points = createCircularWheelLayout(3);
    const polyline = createPolylinePoints([0, 9], points);
    expect(polyline.split(' ')).toHaveLength(1);
  });
});
