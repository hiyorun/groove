export function findMode(arr: number[]): number[] {
  if (arr.length === 0) {
    return [];
  }

  const counts = new Map<number, number>();
  let maxCount = 0;

  for (const num of arr) {
    const currentCount = (counts.get(num) || 0) + 1;
    counts.set(num, currentCount);

    if (currentCount > maxCount) {
      maxCount = currentCount;
    }
  }

  const modes: number[] = [];
  for (const [num, count] of counts.entries()) {
    if (count === maxCount) {
      modes.push(num);
    }
  }

  return modes;
}
