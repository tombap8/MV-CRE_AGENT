export function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  let total = 0;

  for (const word of words) {
    const matches = word.match(/[aeiouy]+/g) ?? [];
    let count = matches.length;
    if (word.endsWith("e") && count > 1) count -= 1;
    total += Math.max(count, 1);
  }

  return total;
}
