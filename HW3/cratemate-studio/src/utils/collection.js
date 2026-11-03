import { CAMELOT_KEYS, musicalKeyFor } from "./records.js";

export function defaultTrack() {
  return {
    title: "",
    artist: "",
    version: "",
    genre: "",
    bpm: "",
    camelot: "",
    energy: "",
    discNumber: "",
    side: "",
    position: "",
    duration: "",
  };
}
export function normalizeTrack(input, id) {
  if (!input.title.trim()) throw new Error("請填寫歌曲名稱。");
  const optionalNumber = (key, min, max = Infinity, integer = false) => {
    if (input[key] === "" || input[key] == null) return null;
    const n = Number(input[key]);
    if (
      !Number.isFinite(n) ||
      n < min ||
      n > max ||
      (integer && !Number.isInteger(n))
    )
      throw new Error("BPM、能量或碟片編號無效。");
    return n;
  };
  if (input.camelot && !CAMELOT_KEYS.includes(input.camelot))
    throw new Error("調性無效。");
  if (input.side && !["A", "B", "C", "D"].includes(input.side))
    throw new Error("請選擇 A、B、C 或 D 面。");
  const duration = input.duration?.trim() || "";
  if (duration && !/^\d+:[0-5]\d$/.test(duration))
    throw new Error("時長請填分:秒，例如 3:43。");
  return {
    ...input,
    id,
    title: input.title.trim(),
    artist: input.artist?.trim() || "",
    version: input.version?.trim() || "",
    genre: input.genre?.trim() || "",
    bpm: optionalNumber("bpm", Number.MIN_VALUE),
    energy: optionalNumber("energy", 1, 10),
    discNumber: optionalNumber("discNumber", 1, Infinity, true),
    camelot: input.camelot || "",
    musicalKey: musicalKeyFor(input.camelot),
    side: input.side || "",
    position: input.position?.trim() || "",
    metadataStatus: "manual",
    duration,
    durationSeconds: duration
      ? duration.split(":").reduce((n, part) => n * 60 + Number(part), 0)
      : null,
  };
}

// Legacy summaries combine several songs, so their one BPM/key must not be
// copied to every song. Retain those old values separately for reference.
export function migrateRecord(record) {
  if (Array.isArray(record.tracks)) return record;
  const { trackFeatured, bpm, camelot, musicalKey, energy, genre, ...album } =
    record;
  const names = (trackFeatured || "")
    .split(/\s+\/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    ...album,
    legacyMixMetadata: {
      trackFeatured,
      bpm,
      camelot,
      musicalKey,
      energy,
      genre,
    },
    tracks: names.map((title, i) => ({
      ...normalizeTrack(
        { ...defaultTrack(), title },
        `${record.id}-track-${i + 1}`,
      ),
      metadataStatus: "legacy-unverified",
    })),
  };
}
export function flattenTracks(records) {
  return records.flatMap((record) =>
    record.tracks.map((track) => ({
      ...track,
      recordId: record.id,
      recordTitle: record.title,
      artist: track.artist || record.artist,
      rpm: record.rpm,
    })),
  );
}
export function physicalConflict(a, b) {
  if (!a || !b || !a.recordId || a.recordId !== b.recordId) return "";
  if (
    a.discNumber != null &&
    b.discNumber != null &&
    a.discNumber !== b.discNumber
  )
    return "";
  return a.discNumber != null && b.discNumber != null
    ? "兩首歌使用同一份收藏的同一張實體碟片，無法同時放上兩台唱盤。"
    : "兩首歌來自同一份收藏，碟片編號尚未確認；請確認是否為可分開使用的不同碟片。";
}
