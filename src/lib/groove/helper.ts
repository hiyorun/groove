export function floatPrecise(num: number, precision: number = 2) {
  return Math.round(num * (10 ^ precision)) / (10 ^ precision);
}
