import { INITIAL_RECORDS, COLLECTION_REVISION } from "../data/records.js";
import { applyTrackPatches } from "../data/trackPatches.js";
import { migrateRecord } from "./collection.js";
import { CAMELOT_KEYS } from "./records.js";
export const STORAGE_KEY = "cratemate-studio:v3";
export const PREVIOUS_STORAGE_KEY = "cratemate-studio:v2";
export const LEGACY_STORAGE_KEY = "cratemate-studio:v1";
export const TRACKED_COLLECTION_REVISION = COLLECTION_REVISION + ":with-tracks";
const BEFORE_EMPTY_RECORD_CLEANUP = "cratemate-studio:backup:before-empty-record-cleanup";

export function loadTrackedCollection(storage) {
  const loaded = loadSnapshot(storage);
  const { data } = loaded;
  if (!data || data.collectionRevision === TRACKED_COLLECTION_REVISION) return loaded;

  const records = data.records.filter((record) => record.tracks.length > 0);
  const removed = data.records.length - records.length;
  if (removed) {
    try {
      storage ??= window.localStorage;
      if (storage.getItem(BEFORE_EMPTY_RECORD_CLEANUP) == null)
        storage.setItem(BEFORE_EMPTY_RECORD_CLEANUP, JSON.stringify(data));
    } catch {
      return { ...loaded, error: "無法備份收藏，未移除無歌曲的唱片。" };
    }
  }
  return {
    ...loaded,
    data: { ...data, records, collectionRevision: TRACKED_COLLECTION_REVISION },
    notice: removed ? `已移除 ${removed} 張無歌曲的唱片，完整收藏已備份在本機。` : loaded.notice,
  };
}

export function readEmptyRecordCleanupBackup(storage = window.localStorage) {
  const raw = storage.getItem(BEFORE_EMPTY_RECORD_CLEANUP);
  if (!raw) throw Error("沒有清理前備份");
  return JSON.parse(raw);
}
const finiteRange = (x, min, max = Infinity) =>
  Number.isFinite(x) && x >= min && x <= max;
function validLegacySnapshot(s) {
  if (
    s?.version !== 1 ||
    !Array.isArray(s.records) ||
    !s.records.length ||
    !Array.isArray(s.setlist)
  )
    return false;
  const ids = new Set();
  for (const r of s.records) {
    if (typeof r.id !== "string" || ids.has(r.id)) return false;
    ids.add(r.id);
    if (
      ![
        "artist",
        "title",
        "trackFeatured",
        "pressing",
        "genre",
        "musicalKey",
        "notes",
        "coverGradient",
        "accentColor",
        "conditionMedia",
        "conditionSleeve",
      ].every((k) => typeof r[k] === "string")
    )
      return false;
    if (
      !CAMELOT_KEYS.includes(r.camelot) ||
      ![33.3, 45].includes(r.rpm) ||
      !finiteRange(r.bpm, Number.MIN_VALUE) ||
      !finiteRange(r.energy, 1, 10) ||
      !finiteRange(r.buyPriceUSD, 0) ||
      !finiteRange(r.currentValUSD, 0) ||
      !finiteRange(r.playCount, 0) ||
      !finiteRange(r.playsSinceClean, 0)
    )
      return false;
  }
  const h = s.hardware;
  return (
    s.setlist.every((id) => ids.has(id)) &&
    ids.has(s.deckAId) &&
    ids.has(s.deckBId) &&
    [8, 16].includes(s.pitchRangeLimit) &&
    typeof s.halfDoubleMode === "boolean" &&
    h &&
    finiteRange(h.stylusHours, 0) &&
    finiteRange(h.trackingForce, 1.2, 4) &&
    typeof h.cartridgeModel === "string" &&
    finiteRange(h.jpTransformerInput, 108, 120) &&
    typeof h.stepDownEnabled === "boolean" &&
    finiteRange(h.roomWidth, 2.4, 6.5)
  );
}
function validV2Snapshot(s) {
  if (
    s?.version !== 2 ||
    !Array.isArray(s.records) ||
    !Array.isArray(s.setlist)
  )
    return false;
  const recordIds = new Set(),
    trackIds = new Set();
  for (const r of s.records) {
    if (
      typeof r.id !== "string" ||
      recordIds.has(r.id) ||
      !Array.isArray(r.tracks)
    )
      return false;
    recordIds.add(r.id);
    if (
      ![
        "artist",
        "title",
        "pressing",
        "notes",
        "coverGradient",
        "accentColor",
        "conditionMedia",
        "conditionSleeve",
      ].every((k) => typeof r[k] === "string") ||
      ![33.3, 45].includes(r.rpm) ||
      !["buyPriceUSD", "currentValUSD", "playCount", "playsSinceClean"].every(
        (k) => finiteRange(r[k], 0),
      )
    )
      return false;
    for (const t of r.tracks) {
      if (
        typeof t.id !== "string" ||
        trackIds.has(t.id) ||
        ![
          "title",
          "artist",
          "version",
          "genre",
          "camelot",
          "side",
          "position",
        ].every((k) => typeof t[k] === "string") ||
        !t.title.trim()
      )
        return false;
      trackIds.add(t.id);
      if (
        (t.bpm !== null && !finiteRange(t.bpm, Number.MIN_VALUE)) ||
        (t.energy !== null && !finiteRange(t.energy, 1, 10)) ||
        (t.discNumber !== null &&
          (!Number.isInteger(t.discNumber) || t.discNumber < 1)) ||
        (t.camelot !== "" && !CAMELOT_KEYS.includes(t.camelot)) ||
        !["", "A", "B", "C", "D"].includes(t.side)
      )
        return false;
    }
  }
  const h = s.hardware;
  return (
    s.setlist.every((id) => trackIds.has(id)) &&
    [s.deckAId, s.deckBId].every((id) => id === "" || trackIds.has(id)) &&
    [8, 16].includes(s.pitchRangeLimit) &&
    typeof s.halfDoubleMode === "boolean" &&
    h &&
    finiteRange(h.stylusHours, 0) &&
    finiteRange(h.trackingForce, 1.2, 4) &&
    typeof h.cartridgeModel === "string" &&
    finiteRange(h.jpTransformerInput, 108, 120) &&
    typeof h.stepDownEnabled === "boolean" &&
    finiteRange(h.roomWidth, 2.4, 6.5)
  );
}
export function migrateSnapshot(s) {
  if (s.version === 2) return s;
  if (!validLegacySnapshot(s)) throw Error("invalid legacy snapshot");
  const records = s.records.map(migrateRecord);
  const first = (id) => records.find((r) => r.id === id)?.tracks[0]?.id || "";
  return {
    ...s,
    version: 2,
    records,
    setlist: s.setlist.map(first).filter(Boolean),
    deckAId: first(s.deckAId),
    deckBId: first(s.deckBId),
  };
}
export function validSnapshot(s) {
  if (s?.version !== 3 || !Array.isArray(s.records)) return false;
  if (
    !s.records.every(
      (r) =>
        (r.buyPriceTWD === null || finiteRange(r.buyPriceTWD, 0)) &&
        (r.currentValTWD === null || finiteRange(r.currentValTWD, 0)) &&
        typeof r.purchaseDate === "string" &&
        typeof r.purchaseLocation === "string",
    )
  )
    return false;
  return validV2Snapshot({
    ...s,
    version: 2,
    records: s.records.map((r) => ({
      ...r,
      buyPriceUSD: r.buyPriceTWD ?? 0,
      currentValUSD: r.currentValTWD ?? 0,
    })),
  });
}
export function loadSnapshot(storage) {
  try {
    storage ??= typeof window === "undefined" ? null : window.localStorage;
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!validSnapshot(data)) throw Error("invalid snapshot");
      const patched = applyTrackPatches(data);
      if (patched !== data) {
        const backupKey = "cratemate-studio:backup:before-nolimit-tracks";
        if (storage.getItem(backupKey) == null) storage.setItem(backupKey, raw);
        for (const patchId of patched.appliedDataPatches) {
          if (data.appliedDataPatches?.includes(patchId)) continue;
          const patchBackupKey = "cratemate-studio:backup:before-track-patch:" + patchId;
          if (storage.getItem(patchBackupKey) == null)
            storage.setItem(patchBackupKey, raw);
        }
      }
      return {
        data: patched,
        error: "",
        notice:
          patched !== data
            ? "已補入專輯曲目資料；先前收藏已保留本機備份。既有手動填寫內容保持不變。"
            : "",
      };
    }
    const oldRaw =
      storage?.getItem(PREVIOUS_STORAGE_KEY) ??
      storage?.getItem(LEGACY_STORAGE_KEY);
    if (!oldRaw) return { data: null, error: "" };
    const source = JSON.parse(oldRaw);
    const old = migrateSnapshot(source);
    if (!validV2Snapshot(old)) throw Error("invalid previous data");
    const backupKey = "cratemate-studio:backup:before-excel:v" + source.version;
    if (storage.getItem(backupKey) == null) storage.setItem(backupKey, oldRaw);
    return {
      data: {
        ...old,
        version: 3,
        collectionRevision: COLLECTION_REVISION,
        records: INITIAL_RECORDS,
        setlist: [],
        deckAId: "",
        deckBId: "",
      },
      error: "",
      notice:
        "已匯入 41 張 Excel 收藏；舊收藏與歌單已備份在本機，硬體設定保留。曲目、品相與市值待補。",
    };
  } catch {
    return {
      data: null,
      error:
        "無法讀取或備份本機保存資料；已載入預覽內容，本次不覆寫原保存資料。請先匯出備份並檢查瀏覽器儲存設定。",
    };
  }
}
export async function saveSnapshot(snapshot, storage = window.localStorage) {
  if (!validSnapshot(snapshot)) throw Error("invalid snapshot");
  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
export function readPreviousBackup(storage = window.localStorage) {
  const raw =
    storage.getItem("cratemate-studio:backup:before-excel:v2") ??
    storage.getItem("cratemate-studio:backup:before-excel:v1");
  if (!raw) throw Error("沒有匯入前備份");
  return JSON.parse(raw);
}
