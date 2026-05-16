export const MIN_WHEEL_UNITS = 5;
export const MAX_WHEEL_UNITS = 10;

export type WheelUnitRange = {
  minWheelUnits: number;
  maxWheelUnits: number;
};

export function clampWheelUnitCount(value: number): number {
  return Math.min(MAX_WHEEL_UNITS, Math.max(MIN_WHEEL_UNITS, value));
}

export function normalizeWheelUnitRange(minWheelUnits: number, maxWheelUnits: number): WheelUnitRange {
  const min = clampWheelUnitCount(minWheelUnits);
  const max = clampWheelUnitCount(Math.max(min, maxWheelUnits));

  return {
    minWheelUnits: min,
    maxWheelUnits: max,
  };
}

export function isWheelUnitCountAllowed(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_WHEEL_UNITS && value <= MAX_WHEEL_UNITS;
}
