import {
  NOLIMIT_TRACKS,
  NOLIMIT_PATCH_ID,
  TELOS_PATCH_ID,
  TELOS_TRACKS,
  KORA_PATCH_ID,
  KORA_TRACKS,
  SILK_SONIC_PATCH_ID,
  SILK_SONIC_TRACKS,
  applyTrackPatches,
} from "../src/data/trackPatches.js";
import {
  defaultTrack,
  normalizeTrack,
  migrateRecord,
  flattenTracks,
  physicalConflict,
} from "../src/utils/collection.js";
import {
  migrateSnapshot,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
} from "../src/utils/storage.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { INITIAL_RECORDS as EXCEL_RECORDS } from "../src/data/records.js";
import { INITIAL_RECORDS as DEMO_RECORDS } from "../src/data/demoRecords.js";
import { collectionStats } from "../src/utils/money.js";
const INITIAL_RECORDS = DEMO_RECORDS.map(
  ({ buyPriceUSD, currentValUSD, ...r }) => ({
    ...r,
    buyPriceTWD: buyPriceUSD * 32.2,
    currentValTWD: currentValUSD * 32.2,
    purchaseDate: "",
    purchaseLocation: "",
  }),
);
import {
  CAMELOT_KEYS,
  defaultRecord,
  normalizeRecord,
  musicalKeyFor,
  valueChange,
} from "../src/utils/records.js";
import { analyzeMix } from "../src/utils/mixing.js";
import {
  loadSnapshot,
  saveSnapshot,
  validSnapshot,
} from "../src/utils/storage.js";
import { copyText, downloadSnapshot } from "../src/utils/io.js";

const record = (changes = {}) =>
  normalizeRecord(
    { ...defaultRecord(), artist: " Artist ", title: " Title ", ...changes },
    "test",
  );
const snapshot = () => ({
  version: 3,
  records: INITIAL_RECORDS,
  setlist: ["rec-1-track-1", "rec-1-track-1", "rec-3-track-1"],
  deckAId: "rec-1-track-1",
  deckBId: "rec-3-track-1",
  pitchRangeLimit: 8,
  halfDoubleMode: false,
  hardware: {
    stylusHours: 1002,
    trackingForce: 3,
    cartridgeModel: "Ortofon Concorde MKII Club (Elliptical)",
    jpTransformerInput: 120,
    stepDownEnabled: true,
    roomWidth: 3.8,
  },
});

test("zero prices and decimal prices are preserved; new records start unplayed", () => {
  const r = record({ buyPriceTWD: "0", currentValTWD: "0" });
  assert.equal(r.buyPriceTWD, 0);
  assert.equal(r.currentValTWD, 0);
  assert.equal(r.playCount, 0);
  assert.equal(r.playsSinceClean, 0);
  assert.equal(record({ buyPriceTWD: "12.34" }).buyPriceTWD, 12.34);
  assert.equal(r.artist, "Artist");
});
test("invalid numeric inputs and blank titles are rejected", () => {
  for (const changes of [
    { buyPriceTWD: -1 },
    { currentValTWD: -1 },
    { title: "   " },
  ])
    assert.throws(() => record(changes));
});

test("pressing and separate media/sleeve grades are retained", () => {
  const r = record({
    pressing: "  Japan OBI Clear 2LP  ",
    conditionMedia: "VG+",
    conditionSleeve: "G",
  });
  assert.equal(r.pressing, "Japan OBI Clear 2LP");
  assert.equal(r.conditionMedia, "VG+");
  assert.equal(r.conditionSleeve, "G");
  assert.equal(record({ pressing: "  " }).pressing, "未註明");
  assert.throws(() => record({ conditionMedia: "invalid" }));
});
test("all 24 keys have synchronized musical names", () => {
  assert.equal(new Set(CAMELOT_KEYS).size, 24);
  for (const camelot of CAMELOT_KEYS) {
    assert.ok(musicalKeyFor(camelot));
    assert.equal(
      normalizeTrack({ ...defaultTrack(), title: "Song", camelot }, "t")
        .musicalKey,
      musicalKeyFor(camelot),
    );
  }
});
test("loss, flat and zero cost returns use honest labels", () => {
  assert.equal(valueChange(100, 50).text, "-50.0%");
  assert.equal(valueChange(100, 50).label, "減值");
  assert.equal(valueChange(100, 50).color, "text-rose-400");
  assert.equal(valueChange(0, 50).text, "—");
  assert.equal(valueChange(50, 50).label, "持平");
});
test("pitch uses logarithmic semitones, key transposition and detune guards", () => {
  const a = { bpm: 100, camelot: "8A", energy: 8, rpm: 33.3 };
  const b = { ...a, bpm: 100 / 0.84 };
  assert.equal(analyzeMix(a, b, 16, false).semitoneShift, "-3.02");
  assert.equal(
    analyzeMix(a, { ...a, bpm: 103 }, 8, false).harmonic.score,
    null,
  );
  assert.equal(analyzeMix(a, a, 8, false).harmonic.score, 100);
  const up = analyzeMix({ ...a, bpm: 100 * 2 ** (1 / 12) }, a, 8, false);
  assert.equal(up.adjustedCamelot, "3A");
  assert.notEqual(up.harmonic.score, 100);
  assert.equal(
    analyzeMix(a, { ...a, bpm: 150 }, 8, false).harmonic.score,
    null,
  );
});
test("half/double mode chooses smallest pitch correction", () => {
  const a = { bpm: 122, camelot: "8A", energy: 8, rpm: 33.3 };
  const r = analyzeMix(a, { ...a, bpm: 240 }, 8, true);
  assert.equal(r.effectiveTargetBpm, 244);
  assert.ok(Math.abs(r.pitchDiffPercent - 1.6666666667) < 1e-8);
});
test("saved collection, duplicates in setlist and hardware survive round trip", async () => {
  let raw;
  const store = {
    setItem: (key, value) => {
      raw = value;
    },
    getItem: () => raw,
  };
  assert.ok(validSnapshot(snapshot()));
  await saveSnapshot(snapshot(), store);
  assert.deepEqual(loadSnapshot(store).data, snapshot());
  assert.equal(loadSnapshot({ getItem: () => "{broken" }).data, null);
  assert.ok(loadSnapshot({ getItem: () => "{broken" }).error);
  assert.equal(validSnapshot({ ...snapshot(), setlist: ["missing"] }), false);
  await assert.rejects(
    saveSnapshot(snapshot(), {
      setItem() {
        throw Error("quota");
      },
    }),
  );
});
test("clipboard waits for success and propagates permission failures", async () => {
  let done = false,
    resolve;
  const pending = copyText("text", {
    writeText: () =>
      new Promise((r) => {
        resolve = r;
      }),
  }).then(() => {
    done = true;
  });
  assert.equal(done, false);
  resolve();
  await pending;
  assert.equal(done, true);
  await assert.rejects(
    copyText("text", { writeText: () => Promise.reject(Error("denied")) }),
  );
});
test("JSON download contains the full state and releases its URL", async () => {
  let blob,
    clicked = false,
    removed = false,
    revoked = false;
  const link = {
    click() {
      clicked = true;
    },
    remove() {
      removed = true;
    },
  };
  downloadSnapshot(snapshot(), {
    Blob,
    document: { createElement: () => link, body: { appendChild() {} } },
    URL: {
      createObjectURL: (b) => {
        blob = b;
        return "blob:test";
      },
      revokeObjectURL: () => {
        revoked = true;
      },
    },
    setTimeout: (fn) => fn(),
  });
  const data = JSON.parse(await blob.text());
  assert.deepEqual(data.records, snapshot().records);
  assert.deepEqual(data.setlist, snapshot().setlist);
  assert.deepEqual(data.hardware, snapshot().hardware);
  assert.ok(data.exportedAt);
  assert.match(link.download, /\.json$/);
  assert.ok(clicked && removed && revoked);
});
test("UI reflects overdue stylus, actual voltage, losses and restored data", async () => {
  const server = await createServer({
    cacheDir: "node_modules/.vite-logic-tests",
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  try {
    const { default: Hardware } = await server.ssrLoadModule(
      "/src/components/HardwareMonitor.jsx",
    );
    let html = renderToStaticMarkup(
      createElement(Hardware, {
        ...snapshot().hardware,
        stylusMaxHours: 1000,
        speakerDist: 1.82,
      }),
    );
    assert.ok(html.includes("已達建議壽命"));
    assert.ok(html.includes("104.3V"));
    assert.ok(!html.includes("100.2V"));
    html = renderToStaticMarkup(
      createElement(Hardware, {
        ...snapshot().hardware,
        stylusHours: 800,
        stylusMaxHours: 1000,
        stepDownEnabled: false,
        speakerDist: 1.82,
      }),
    );
    assert.ok(html.includes("接近建議壽命"));
    assert.ok(html.includes("120.0V"));
    const { default: Card } = await server.ssrLoadModule(
      "/src/components/CrateTab/RecordCard.jsx",
    );
    html = renderToStaticMarkup(
      createElement(Card, {
        rec: record({ buyPriceTWD: 100, currentValTWD: 50 }),
      }),
    );
    assert.ok(html.includes("-50%"));
    assert.ok(!html.includes("+-50%"));
    const { default: Mixer } = await server.ssrLoadModule(
      "/src/components/MixerDeck.jsx",
    );
    html = renderToStaticMarkup(
      createElement(Mixer, {
        records: INITIAL_RECORDS,
        tracks: flattenTracks(INITIAL_RECORDS),
        deckA: flattenTracks(INITIAL_RECORDS)[0],
        deckB: flattenTracks(INITIAL_RECORDS)[4],
        deckAId: "rec-1",
        deckBId: "rec-3",
        pitchRangeLimit: 8,
        halfDoubleMode: false,
        mixAnalysis: analyzeMix(
          flattenTracks(INITIAL_RECORDS)[0],
          flattenTracks(INITIAL_RECORDS)[4],
          8,
          false,
        ),
        setlist: [INITIAL_RECORDS[0], INITIAL_RECORDS[2]],
      }),
    );
    assert.ok(html.includes("歌曲缺少有效的 BPM 或調性"));
    assert.ok(!html.includes("92% 契合"));
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    const state = snapshot();
    state.records = [record({ title: "Restored Album" })];
    state.records[0].tracks = [
      normalizeTrack(
        { ...defaultTrack(), title: "Restored Song" },
        "test-track",
      ),
    ];
    state.setlist = ["test-track"];
    state.deckAId = "test-track";
    state.deckBId = "test-track";
    globalThis.window = {
      localStorage: { getItem: () => JSON.stringify(state) },
    };
    html = renderToStaticMarkup(createElement(App));
    assert.ok(html.includes("Restored Album"));
    assert.ok(!html.includes("Hyperdrama"));
  } finally {
    delete globalThis.window;
    await server.close();
  }
});

test("one album contains independent songs without duplicating its price", () => {
  const album = record();
  album.tracks = [
    normalizeTrack(
      {
        ...defaultTrack(),
        title: "One",
        bpm: 120,
        camelot: "8A",
        discNumber: 1,
        side: "A",
      },
      "t1",
    ),
    normalizeTrack(
      {
        ...defaultTrack(),
        title: "Two",
        bpm: 128,
        camelot: "9A",
        discNumber: 2,
        side: "B",
      },
      "t2",
    ),
  ];
  const songs = flattenTracks([album]);
  assert.equal(songs.length, 2);
  assert.equal(songs[0].bpm, 120);
  assert.equal(songs[1].bpm, 128);
  assert.equal(songs[1].recordId, album.id);
  assert.equal(album.buyPriceTWD, null);
  assert.equal(physicalConflict(songs[0], songs[1]), "");
  assert.ok(physicalConflict(songs[0], { ...songs[1], discNumber: 1 }));
  assert.ok(physicalConflict(songs[0], { ...songs[1], discNumber: null }));
  assert.equal(
    physicalConflict(songs[0], { ...songs[1], recordId: "other-copy" }),
    "",
  );
  assert.ok(
    analyzeMix(songs[0], { ...songs[1], discNumber: 1 }, 8, false).blocked,
  );
});
test("unknown track metadata remains unknown and cannot produce a mixing score", () => {
  const t = normalizeTrack({ ...defaultTrack(), title: "Unknown" }, "t");
  assert.equal(t.bpm, null);
  assert.equal(t.energy, null);
  assert.equal(t.discNumber, null);
  assert.ok(analyzeMix(t, t, 8, false).blocked);
  for (const input of [
    { bpm: 0 },
    { bpm: -1 },
    { bpm: Infinity },
    { discNumber: 1.5 },
    { energy: 11 },
    { side: "Z" },
  ])
    assert.throws(() =>
      normalizeTrack({ ...defaultTrack(), title: "Song", ...input }, "t"),
    );
});
test("legacy migration preserves collection, counts, hardware and old backup without assigning shared BPMs", () => {
  const original = {
    ...DEMO_RECORDS[0],
    ...DEMO_RECORDS[0].legacyMixMetadata,
  };
  delete original.tracks;
  delete original.legacyMixMetadata;
  const migrated = migrateRecord(original);
  assert.equal(migrated.tracks.length, 2);
  assert.equal(migrated.tracks[0].bpm, null);
  assert.equal(migrated.tracks[1].camelot, "");
  assert.equal(migrated.legacyMixMetadata.bpm, 122);
  assert.equal(migrated.playCount, original.playCount);
  const old = {
    ...snapshot(),
    version: 1,
    records: [original],
    setlist: ["rec-1", "rec-1"],
    deckAId: "rec-1",
    deckBId: "rec-1",
  };
  const result = migrateSnapshot(old);
  assert.equal(result.version, 2);
  assert.equal(result.setlist[0], "rec-1-track-1");
  assert.deepEqual(result.hardware, old.hardware);
  const entries = new Map([[LEGACY_STORAGE_KEY, JSON.stringify(old)]]);
  const storage = {
    getItem: (k) => entries.get(k) ?? null,
    setItem: (k, v) => entries.set(k, v),
  };
  const loaded = loadSnapshot(storage);
  assert.ok(loaded.notice);
  assert.equal(loaded.data.version, 3);
  assert.equal(loaded.data.records.length, 41);
  assert.equal(entries.has("cratemate-studio:backup:before-excel:v1"), true);
  assert.deepEqual(loaded.data.hardware, old.hardware);
  assert.equal(entries.has(STORAGE_KEY), false);
  assert.equal(JSON.parse(entries.get(LEGACY_STORAGE_KEY)).version, 1);
});

test("Excel import preserves 41 owned records and treats missing amounts as unknown", () => {
  assert.equal(EXCEL_RECORDS.length, 41);
  assert.ok(EXCEL_RECORDS.every((r) => r.rpm === 33.3));
  const stats = collectionStats(EXCEL_RECORDS);
  assert.equal(stats.totalCostTWD, 59671);
  assert.equal(stats.unknownCostCount, 1);
  assert.equal(stats.totalValTWD, null);
  assert.equal(stats.unknownValueCount, 41);
  assert.equal(EXCEL_RECORDS.find((r) => r.sourceRow === 9).buyPriceTWD, null);
  assert.equal(EXCEL_RECORDS.find((r) => r.sourceRow === 28).buyPriceTWD, 2499);
  assert.equal(
    EXCEL_RECORDS.find((r) => r.sourceRow === 45).pressing,
    "(UO Exclusive) Opaque Pink Marble",
  );
  assert.equal(
    EXCEL_RECORDS.find((r) => r.sourceRow === 8).purchaseDate,
    "2024-11-01",
  );
  assert.ok(
    EXCEL_RECORDS.every(
      (r) =>
        r.conditionMedia === "" &&
        r.year === null &&
        (r.id === "excel-vinyl-25"
          ? r.tracks.length === 17
          : r.id === "excel-vinyl-17"
            ? r.tracks.length === 10
            : r.id === "excel-vinyl-10"
              ? r.tracks.length === 3
              : r.id === "excel-vinyl-16"
                ? r.tracks.length === 10
                : r.id === "excel-vinyl-13"
                  ? r.tracks.length === 14
                  : r.id === "excel-vinyl-31"
                    ? r.tracks.length === 8
                    : r.tracks.length === 0),
    ),
  );
  assert.equal(
    record({ buyPriceTWD: "", currentValTWD: "" }).buyPriceTWD,
    null,
  );
  assert.equal(valueChange(null, 20).label, "資料不足");
});

test("v2 import backs up before replacement, preserves hardware, and runs only once", async () => {
  const old = { ...snapshot(), version: 2, records: DEMO_RECORDS };
  const raw = JSON.stringify(old);
  const entries = new Map([["cratemate-studio:v2", raw]]);
  const store = {
    getItem: (k) => entries.get(k) ?? null,
    setItem: (k, v) => entries.set(k, v),
  };
  const loaded = loadSnapshot(store);
  assert.equal(loaded.data.records.length, 41);
  assert.deepEqual(loaded.data.hardware, old.hardware);
  assert.equal(entries.get("cratemate-studio:backup:before-excel:v2"), raw);
  assert.equal(entries.get("cratemate-studio:v2"), raw);
  assert.deepEqual(loaded.data.setlist, []);
  await saveSnapshot(loaded.data, store);
  const edited = JSON.parse(entries.get(STORAGE_KEY));
  edited.records[0].notes = "My saved note";
  entries.set(STORAGE_KEY, JSON.stringify(edited));
  assert.equal(loadSnapshot(store).data.records[0].notes, "My saved note");
  const failure = loadSnapshot({
    getItem: (k) => (k === "cratemate-studio:v2" ? raw : null),
    setItem() {
      throw Error("quota");
    },
  });
  assert.ok(failure.error);
  assert.equal(failure.data, null);
});

test("NoLimit reference contains all 17 positions, exact timings and key conversions", () => {
  assert.equal(NOLIMIT_TRACKS.length, 17);
  assert.deepEqual(
    NOLIMIT_TRACKS.map((t) => t.side + t.position),
    [
      "A1",
      "A2",
      "A3",
      "A4",
      "A5",
      "B1",
      "B2",
      "B3",
      "B4",
      "C1",
      "C2",
      "C3",
      "C4",
      "D1",
      "D2",
      "D3",
      "D4",
    ],
  );
  assert.equal(
    NOLIMIT_TRACKS.reduce((n, t) => n + t.durationSeconds, 0),
    3330,
  );
  assert.deepEqual(
    NOLIMIT_TRACKS.map((t) => t.bpm),
    [
      132, 99, 132, 130, 125, 128, 87, 125, 145, 135, 68, 135, 85, 130, 128,
      142, 99,
    ],
  );
  assert.deepEqual(
    NOLIMIT_TRACKS.map((t) => t.camelot),
    [
      "4B",
      "1A",
      "4A",
      "4A",
      "8A",
      "7A",
      "7A",
      "7A",
      "7A",
      "2A",
      "6A",
      "5A",
      "1B",
      "10A",
      "5A",
      "7B",
      "3B",
    ],
  );
  assert.ok(
    NOLIMIT_TRACKS.every(
      (t) =>
        t.discNumber === ("AB".includes(t.side) ? 1 : 2) && t.energy === null,
    ),
  );
  const songs = flattenTracks([
    {
      ...EXCEL_RECORDS.find((r) => r.id === "excel-vinyl-25"),
      tracks: NOLIMIT_TRACKS,
    },
  ]);
  assert.ok(physicalConflict(songs[0], songs[5]));
  assert.equal(physicalConflict(songs[0], songs[9]), "");
  assert.equal(
    normalizeTrack(
      { ...defaultTrack(), title: "Duration", duration: "3:43" },
      "t",
    ).durationSeconds,
    223,
  );
  assert.throws(() =>
    normalizeTrack(
      { ...defaultTrack(), title: "Duration", duration: "3:99" },
      "t",
    ),
  );
});
test("NoLimit patch is idempotent and preserves manually entered tracks, deck IDs and other albums", () => {
  const records = structuredClone(EXCEL_RECORDS);
  const album = records.find((r) => r.id === "excel-vinyl-25");
  album.tracks = [
    {
      ...NOLIMIT_TRACKS[0],
      id: "my-rookie",
      bpm: 133,
      duration: "",
      durationSeconds: null,
    },
  ];
  const state = {
    ...snapshot(),
    records,
    deckAId: "my-rookie",
    deckBId: "",
    setlist: ["my-rookie"],
  };
  const patched = applyTrackPatches(state);
  assert.equal(
    patched.records.find((r) => r.id === album.id).tracks.length,
    17,
  );
  assert.equal(
    patched.records.find((r) => r.id === album.id).tracks[0].bpm,
    133,
  );
  assert.equal(
    patched.records.find((r) => r.id === album.id).tracks[0].durationSeconds,
    223,
  );
  assert.equal(patched.deckAId, "my-rookie");
  assert.deepEqual(patched.setlist, ["my-rookie"]);
  assert.ok(patched.appliedDataPatches.includes(NOLIMIT_PATCH_ID));
  assert.equal(applyTrackPatches(patched), patched);
  assert.deepEqual(patched.records[0], state.records[0]);
  const raw = JSON.stringify(state);
  const entries = new Map([[STORAGE_KEY, raw]]);
  const storage = {
    getItem: (k) => entries.get(k) ?? null,
    setItem: (k, v) => entries.set(k, v),
  };
  const loaded = loadSnapshot(storage);
  assert.ok(loaded.notice);
  assert.equal(
    entries.get("cratemate-studio:backup:before-nolimit-tracks"),
    raw,
  );
  assert.ok(validSnapshot(loaded.data));
});

test("Telos adds ten reference tracks once and preserves other albums and manual edits", () => {
  assert.deepEqual(TELOS_TRACKS.map((t) => t.side + t.position),
    ["A1", "A2", "A3", "A4", "A5", "A6", "B1", "B2", "B3", "B4"]);
  assert.deepEqual(TELOS_TRACKS.map((t) => t.bpm),
    [130, 110, 124, 151, 90, 96, 122, 123, 98, 119]);
  assert.deepEqual(TELOS_TRACKS.map((t) => t.camelot),
    ["7A", "4A", "1B", "8A", "10A", "10B", "6A", "5A", "7A", "8B"]);
  assert.equal(TELOS_TRACKS.reduce((sum, t) => sum + t.durationSeconds, 0), 2263);
  assert.ok(TELOS_TRACKS.every((t) => t.discNumber === 1 && t.energy === null && t.vinylAudioVerified === false));
  const records = structuredClone(EXCEL_RECORDS);
  const album = records.find((r) => r.id === "excel-vinyl-17");
  album.tracks = [{ ...TELOS_TRACKS[0], id: "my-out-of-time", bpm: 131 }];
  const before = { ...snapshot(), records, appliedDataPatches: [NOLIMIT_PATCH_ID], deckAId: "my-out-of-time", deckBId: "", setlist: ["my-out-of-time"] };
  const raw = JSON.stringify(before);
  const entries = new Map([[STORAGE_KEY, raw]]);
  const loaded = loadSnapshot({ getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) });
  const after = loaded.data;
  assert.ok(validSnapshot(after));
  assert.equal(after.records.length, 41);
  assert.equal(after.records.find((r) => r.id === album.id).tracks.length, 10);
  assert.equal(after.records.find((r) => r.id === album.id).tracks[0].bpm, 131);
  assert.equal(after.deckAId, before.deckAId);
  assert.deepEqual(after.setlist, before.setlist);
  assert.deepEqual(after.records.filter((r) => r.id !== album.id), before.records.filter((r) => r.id !== album.id));
  assert.ok(after.appliedDataPatches.includes(TELOS_PATCH_ID));
  assert.equal(applyTrackPatches(after), after);
  assert.equal(entries.get("cratemate-studio:backup:before-track-patch:" + TELOS_PATCH_ID), raw);
});


test("Kora reference preserves confirmed duration and patches saved collections without replacing other albums", () => {
  assert.deepEqual(KORA_TRACKS.map((t) => [t.title, t.side + t.position, t.bpm, t.camelot, t.duration]), [
    ["Yo Yan", "A1", 75, "3B", "2:00"],
    ["Someone Said", "A2", 150, "4B", "2:48"],
    ["Kora", "A3", 127, "10B", "3:40"],
  ]);
  assert.equal(KORA_TRACKS.reduce((sum, t) => sum + t.durationSeconds, 0), 508);
  assert.ok(KORA_TRACKS.every((t) => t.discNumber === 1 && t.energy === null && t.vinylAudioVerified === false));
  const records = structuredClone(EXCEL_RECORDS);
  const album = records.find((r) => r.id === "excel-vinyl-10");
  album.tracks = [{ ...KORA_TRACKS[0], id: "my-yo-yan", bpm: 76 }];
  const before = { ...snapshot(), records, appliedDataPatches: [NOLIMIT_PATCH_ID, TELOS_PATCH_ID], deckAId: "my-yo-yan", deckBId: "", setlist: ["my-yo-yan"] };
  const raw = JSON.stringify(before);
  const entries = new Map([[STORAGE_KEY, raw]]);
  const after = loadSnapshot({ getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) }).data;
  assert.ok(validSnapshot(after));
  assert.equal(after.records.length, 41);
  assert.equal(after.records.find((r) => r.id === album.id).tracks.length, 3);
  assert.equal(after.records.find((r) => r.id === album.id).tracks[0].bpm, 76);
  assert.equal(after.deckAId, before.deckAId);
  assert.deepEqual(after.setlist, before.setlist);
  assert.deepEqual(after.records.filter((r) => r.id !== album.id), before.records.filter((r) => r.id !== album.id));
  assert.ok(after.appliedDataPatches.includes(KORA_PATCH_ID));
  assert.equal(applyTrackPatches(after), after);
  assert.equal(entries.get("cratemate-studio:backup:before-track-patch:" + KORA_PATCH_ID), raw);
});


test("Silk Sonic uses the confirmed ten-track vinyl order and preserves saved collections", () => {
  assert.deepEqual(SILK_SONIC_TRACKS.map((t) => t.side + t.position), ["A1", "A2", "A3", "A4", "A5", "B6", "B7", "B8", "B9", "B10"]);
  assert.equal(SILK_SONIC_TRACKS[8].title, "Love's Train");
  assert.equal(SILK_SONIC_TRACKS[9].title, "Blast Off");
  assert.deepEqual(SILK_SONIC_TRACKS.map((t) => t.bpm), [115, 148, 100, 70, 82, 144, 102, 112, 141, 152]);
  assert.deepEqual(SILK_SONIC_TRACKS.map((t) => t.camelot), ["1A", "8B", "9A", "6A", "10B", "12A", "6A", "8B", "11B", "12A"]);
  assert.equal(SILK_SONIC_TRACKS.reduce((sum, t) => sum + t.durationSeconds, 0), 2184);
  assert.ok(SILK_SONIC_TRACKS.every((t) => t.discNumber === 1 && t.energy === null && t.vinylAudioVerified === false));
  const records = structuredClone(EXCEL_RECORDS);
  const album = records.find((r) => r.id === "excel-vinyl-16");
  album.tracks = [{ ...SILK_SONIC_TRACKS[0], id: "my-intro", bpm: 116 }];
  const before = { ...snapshot(), records, appliedDataPatches: [NOLIMIT_PATCH_ID, TELOS_PATCH_ID, KORA_PATCH_ID], deckAId: "my-intro", deckBId: "", setlist: ["my-intro"] };
  const raw = JSON.stringify(before);
  const entries = new Map([[STORAGE_KEY, raw]]);
  const after = loadSnapshot({ getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) }).data;
  assert.ok(validSnapshot(after));
  assert.equal(after.records.length, 41);
  assert.equal(after.records.find((r) => r.id === album.id).tracks.length, 10);
  assert.equal(after.records.find((r) => r.id === album.id).tracks[0].bpm, 116);
  assert.equal(after.deckAId, before.deckAId);
  assert.deepEqual(after.setlist, before.setlist);
  assert.deepEqual(after.records.filter((r) => r.id !== album.id), before.records.filter((r) => r.id !== album.id));
  assert.ok(after.appliedDataPatches.includes(SILK_SONIC_PATCH_ID));
  assert.equal(applyTrackPatches(after), after);
  assert.equal(entries.get("cratemate-studio:backup:before-track-patch:" + SILK_SONIC_PATCH_ID), raw);
});
