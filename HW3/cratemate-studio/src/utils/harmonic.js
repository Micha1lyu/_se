const parseCamelot = (code) => {
  if (!code) return { num: 8, letter: "A" };
  const num = parseInt(code.slice(0, -1), 10) || 8;
  const letter = code.slice(-1).toUpperCase() === "B" ? "B" : "A";
  return { num, letter };
};

export const evaluateHarmonicMatch = (camA, camB) => {
  const a = parseCamelot(camA);
  const b = parseCamelot(camB);
  const diff = Math.abs(a.num - b.num);
  const circularDiff = Math.min(diff, 12 - diff);

  if (a.num === b.num && a.letter === b.letter) {
    return {
      score: 100,
      status: "PERFECT_UNISON",
      label: "Perfect Harmonic Unison (同調完美共振)",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/40",
      advice:
        "兩首曲目處於完全相同的調性中心，可進行長達 32-64 小節的雙軌疊加混音 (Long Blend)，旋律與 Bassline 完全不打架。",
    };
  }
  if (a.num === b.num && a.letter !== b.letter) {
    return {
      score: 94,
      status: "RELATIVE_SCALE",
      label: "Relative Major / Minor (關係大小調轉換)",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/40",
      advice:
        "音階組成音完全相同，但情緒由「深沉內斂 (A)」轉向「明亮開闊 (B)」或反之，適合創造細膩的敘事轉折。",
    };
  }
  if (circularDiff === 1 && a.letter === b.letter) {
    return {
      score: 92,
      status: "FIFTH_STEP",
      label: "Adjacent Fifth Step (+1/-1 五度圈順接)",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/40",
      advice:
        "標準俱樂部和聲混音法！五度圈相鄰調性僅相差一個升降記號，混音滑順且能自然推進舞池能量。",
    };
  }
  if (circularDiff === 2 && a.letter === b.letter) {
    return {
      score: 78,
      status: "ENERGY_BOOST",
      label: "Whole-Step Energy Boost (+2/-2 全音能量跳躍)",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/40",
      advice:
        "具備強烈能量拉升感 (Energy Boost Mix)，建議在無主旋律的純鼓組 (Intro/Outro Drum Loop) 段落快速切換低頻 EQ。",
    };
  }
  return {
    score: 52,
    status: "PERCUSSIVE_CUT",
    label: "Chromatic Clash — Percussive Cut Only (調性衝突・建議節奏切入)",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/40",
    advice:
      "兩首曲目和聲重疊會產生不協和音。請避免同時開啟雙軌旋律，務必使用 High-Pass Filter 濾除舊曲低頻，或於 Breakdown 瞬間做 Drop Cut。",
  };
};
