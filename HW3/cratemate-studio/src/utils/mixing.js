import { physicalConflict } from "./collection.js";
import { evaluateHarmonicMatch } from "./harmonic.js";
import { CAMELOT_KEYS } from "./records.js";

export function analyzeMix(deckA, deckB, pitchRangeLimit, halfDoubleMode) {
  const conflict = physicalConflict(deckA, deckB);
  const missing =
    ![deckA.bpm, deckB.bpm].every((n) => Number.isFinite(n) && n > 0) ||
    ![deckA.camelot, deckB.camelot].every((k) => CAMELOT_KEYS.includes(k));
  if (conflict || missing)
    return {
      blocked: true,
      reason: conflict || "歌曲缺少有效的 BPM 或調性，請先補齊歌曲資料。",
      harmonic: { score: null },
      museAdvice: [],
    };
  const targets = halfDoubleMode
    ? [deckA.bpm, deckA.bpm / 2, deckA.bpm * 2]
    : [deckA.bpm];
  const effectiveTargetBpm = targets.reduce((best, target) =>
    Math.abs(target - deckB.bpm) < Math.abs(best - deckB.bpm) ? target : best,
  );
  const ratio = effectiveTargetBpm / deckB.bpm;
  const pitchDiffPercent = (ratio - 1) * 100;
  const shift = 12 * Math.log2(ratio);
  const nearest = Math.round(shift);
  const detuneCents = (shift - nearest) * 100;
  // A semitone moves seven positions around the Camelot fifths circle.
  const number =
    ((((parseInt(deckB.camelot, 10) - 1 + nearest * 7) % 12) + 12) % 12) + 1;
  const adjustedCamelot = `${number}${deckB.camelot.slice(-1)}`;
  let harmonic;
  if (
    !CAMELOT_KEYS.includes(deckA.camelot) ||
    !CAMELOT_KEYS.includes(deckB.camelot) ||
    Math.abs(detuneCents) > 10
  ) {
    harmonic = {
      score: null,
      label: "調速後有音準偏差，請試聽確認",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/40",
      advice: `相對最近半音偏差 ${detuneCents.toFixed(1)} cents，無法直接套用離散 Camelot 評分。建議使用鼓組過渡或確認音準。`,
    };
  } else {
    harmonic = evaluateHarmonicMatch(deckA.camelot, adjustedCamelot);
    harmonic = {
      ...harmonic,
      label: `近似評估：${harmonic.label}`,
      advice: `依調速後近似調性 ${adjustedCamelot} 評估，殘餘音準偏差 ${detuneCents.toFixed(1)} cents；仍需試聽確認。${harmonic.advice}`,
    };
  }
  const withinRange = Math.abs(pitchDiffPercent) <= pitchRangeLimit;
  if (!withinRange)
    harmonic = {
      score: null,
      label: "超出推桿範圍，無法完成此對拍",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/40",
      advice: "先選擇可達成的速度組合，再評估調速後的和聲。",
    };
  const museAdvice = [
    withinRange
      ? `Deck B 對拍至 ${effectiveTargetBpm} BPM，推桿需 ${pitchDiffPercent >= 0 ? "+" : ""}${pitchDiffPercent.toFixed(2)}%，音高偏移 ${shift.toFixed(2)} 半音（未鎖調）。`
      : `所需推桿 ${pitchDiffPercent.toFixed(2)}% 超出 ±${pitchRangeLimit}%；請更換曲目、調整範圍或嘗試倍速折算。`,
    deckA.energy == null || deckB.energy == null
      ? "能量資料未填，請依實際試聽安排過渡。"
      : deckB.energy > deckA.energy
        ? "能量上升：可在樂句交接處逐步交換低頻 EQ。"
        : deckB.energy < deckA.energy
          ? "能量下降：可利用濾波或殘響平順過渡。"
          : "能量持平：依曲式安排平順過渡。",
  ];
  if (deckA.rpm !== deckB.rpm)
    museAdvice.push(
      `放下唱針前確認轉速：Deck A ${deckA.rpm} RPM、Deck B ${deckB.rpm} RPM。`,
    );
  return {
    effectiveTargetBpm,
    pitchDiffPercent,
    withinRange,
    semitoneShift: shift.toFixed(2),
    adjustedCamelot,
    detuneCents,
    harmonic,
    museAdvice,
  };
}
