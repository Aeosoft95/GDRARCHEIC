export function rollD6(n = 1): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
}
export function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}
