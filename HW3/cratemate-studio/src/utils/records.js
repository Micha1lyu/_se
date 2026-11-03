export const CAMELOT_KEYS = Array.from({ length: 12 }, (_, i) => [
  `${i + 1}A`,
  `${i + 1}B`,
]).flat();
export const CONDITION_GRADES = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];
const minorNames = [
  "G# Minor",
  "D# Minor",
  "A# Minor",
  "F Minor",
  "C Minor",
  "G Minor",
  "D Minor",
  "A Minor",
  "E Minor",
  "B Minor",
  "F# Minor",
  "C# Minor",
];
const majorNames = [
  "B Major",
  "F# Major",
  "C# Major",
  "G# Major",
  "D# Major",
  "A# Major",
  "F Major",
  "C Major",
  "G Major",
  "D Major",
  "A Major",
  "E Major",
];
export function musicalKeyFor(camelot) {
  if (!CAMELOT_KEYS.includes(camelot)) return "";
  return (camelot.endsWith("A") ? minorNames : majorNames)[
    parseInt(camelot, 10) - 1
  ];
}
export function defaultRecord() {
  return {
    artist: "",
    title: "",
    year: "",
    rpm: 33.3,
    pressing: "",
    conditionMedia: "",
    conditionSleeve: "",
    buyPriceTWD: "",
    currentValTWD: "",
    purchaseDate: "",
    purchaseLocation: "",
    tracks: [],
  };
}
export function normalizeRecord(input, id) {
  if (!input.artist.trim() || !input.title.trim())
    throw new Error("請填寫藝人與專輯名稱。");
  const numeric = {};
  for (const key of ["rpm", "buyPriceTWD", "currentValTWD"]) {
    const value = input[key];
    if (key !== "rpm" && (value === "" || value == null)) {
      numeric[key] = null;
      continue;
    }
    if (String(value).trim() === "" || !Number.isFinite(Number(value)))
      throw new Error("請填寫完整且有效的數值。");
    numeric[key] = Number(value);
  }
  if (numeric.buyPriceTWD < 0 || numeric.currentValTWD < 0)
    throw new Error("價格不可小於 0。");
  if (![33.3, 45].includes(numeric.rpm)) throw new Error("轉速無效。");
  if (
    ![input.conditionMedia, input.conditionSleeve].every(
      (grade) => grade === "" || CONDITION_GRADES.includes(grade),
    )
  )
    throw new Error("請選擇有效的唱片與封套品相。");
  return {
    ...input,
    ...numeric,
    artist: input.artist.trim(),
    title: input.title.trim(),
    pressing: input.pressing.trim() || "未註明",
    year: input.year === "" ? null : Number(input.year),
    purchaseDate: input.purchaseDate || "",
    purchaseLocation: input.purchaseLocation || "",
    tracks: [],
    id,
    playCount: 0,
    playsSinceClean: 0,
    coverGradient: "from-amber-500/30 via-emerald-900/40 to-zinc-950",
    accentColor: "#10b981",
    notes: "手動新增的黑膠收藏。",
  };
}
export function valueChange(cost, value, digits = 1) {
  if (!Number.isFinite(cost) || !Number.isFinite(value))
    return { text: "—", label: "資料不足", color: "text-zinc-400" };
  const change = value - cost;
  return {
    text:
      cost > 0
        ? `${change > 0 ? "+" : ""}${((change / cost) * 100).toFixed(digits)}%`
        : "—",
    label: change < 0 ? "減值" : change > 0 ? "增值" : "持平",
    color:
      change < 0
        ? "text-rose-400"
        : change > 0
          ? "text-emerald-400"
          : "text-zinc-400",
  };
}
