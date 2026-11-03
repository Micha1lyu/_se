export const formatTWD = (value) =>
  Number.isFinite(value) ? `NT$ ${value.toLocaleString("zh-TW")}` : "未知";
export function collectionStats(records) {
  const knownCosts = records.filter((r) => Number.isFinite(r.buyPriceTWD));
  const knownValues = records.filter((r) => Number.isFinite(r.currentValTWD));
  return {
    rpmLabel: [...new Set(records.map(r => r.rpm === 45 ? '45' : '33⅓'))].join(' / ') + ' RPM',
    totalCostTWD: knownCosts.reduce((n, r) => n + r.buyPriceTWD, 0),
    totalValTWD:
      knownValues.length === records.length
        ? knownValues.reduce((n, r) => n + r.currentValTWD, 0)
        : null,
    unknownCostCount: records.length - knownCosts.length,
    unknownValueCount: records.length - knownValues.length,
    trackCount: records.reduce((n, r) => n + r.tracks.length, 0),
    keyedTrackCount: records.reduce(
      (n, r) => n + r.tracks.filter((t) => t.camelot).length,
      0,
    ),
    needsCleaningCount: records.filter((r) => r.playsSinceClean >= 8).length,
  };
}
