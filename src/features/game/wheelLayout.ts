export type WheelPoint = {
  x: number;
  y: number;
};

export function createCircularWheelLayout(count: number): WheelPoint[] {
  if (count <= 0) return [];

  const radius = count <= 5 ? 32 : count <= 7 ? 34 : 36;
  const center = 50;
  const startAngle = -90;

  return Array.from({ length: count }, (_, index) => {
    const angle = startAngle + (360 / count) * index;
    const radians = (angle * Math.PI) / 180;

    return {
      x: Number((center + radius * Math.cos(radians)).toFixed(3)),
      y: Number((center + radius * Math.sin(radians)).toFixed(3)),
    };
  });
}

export function createPolylinePoints(indexes: number[], points: WheelPoint[]): string {
  return indexes
    .map((index) => points[index])
    .filter((point): point is WheelPoint => Boolean(point))
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
}
