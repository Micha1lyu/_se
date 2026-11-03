import sourceTracks from "./knock2NolimitTracks.json" with { type: "json" };
import telosSourceTracks from "./zeddTelosTracks.json" with { type: "json" };
import koraSourceTracks from "./skrillexKoraTracks.json" with { type: "json" };
import silkSonicSourceTracks from "./silkSonicTracks.json" with { type: "json" };
import discoverySourceTracks from "./daftPunkDiscoveryTracks.json" with { type: "json" };
import fourEvrSourceTracks from "./isoknock4evrTracks.json" with { type: "json" };
import { musicalKeyFor } from "../utils/records.js";

export const NOLIMIT_PATCH_ID = "knock2-nolimit-user-reference-v1";
export const TELOS_PATCH_ID = "zedd-telos-user-reference-v1";
export const KORA_PATCH_ID = "skrillex-kora-user-reference-v1";
export const SILK_SONIC_PATCH_ID = "silk-sonic-evening-user-reference-v1";
const DISCOVERY_PATCH_ID = "daft-punk-discovery-user-reference-v1";
const FOUR_EVR_PATCH_ID = "isoknock-4evr-user-reference-v1";
export const TRACK_PATCH_IDS = [
  NOLIMIT_PATCH_ID,
  TELOS_PATCH_ID,
  KORA_PATCH_ID,
  SILK_SONIC_PATCH_ID,
  DISCOVERY_PATCH_ID,
  FOUR_EVR_PATCH_ID,
];
const fourEvrTracks = fourEvrSourceTracks.map((track) => ({
  ...track,
  musicalKey: musicalKeyFor(track.camelot),
}));
const discoveryTracks = discoverySourceTracks.map((track) => ({
  ...track,
  musicalKey: musicalKeyFor(track.camelot),
}));
export const SILK_SONIC_TRACKS = silkSonicSourceTracks.map((track) => ({
  ...track,
  musicalKey: musicalKeyFor(track.camelot),
}));
export const KORA_TRACKS = koraSourceTracks.map((track) => ({
  ...track,
  musicalKey: musicalKeyFor(track.camelot),
}));
export const TELOS_TRACKS = telosSourceTracks.map((track) => ({
  ...track,
  musicalKey: musicalKeyFor(track.camelot),
}));
export const NOLIMIT_TRACKS = sourceTracks.map((track) => ({
  ...track,
  musicalKey: musicalKeyFor(track.camelot),
}));

export function applyTrackPatches(snapshot) {
  for (const patch of [
    { id: NOLIMIT_PATCH_ID, recordId: "excel-vinyl-25", artist: "knock2", title: "nolimit", tracks: NOLIMIT_TRACKS },
    { id: TELOS_PATCH_ID, recordId: "excel-vinyl-17", artist: "zedd", title: "telos", tracks: TELOS_TRACKS },
    { id: KORA_PATCH_ID, recordId: "excel-vinyl-10", artist: "skrillex", title: "kora", tracks: KORA_TRACKS },
    { id: SILK_SONIC_PATCH_ID, recordId: "excel-vinyl-16", artist: "silk sonic", title: "an evening with silk sonic", tracks: SILK_SONIC_TRACKS },
    {
      id: DISCOVERY_PATCH_ID,
      recordId: "excel-vinyl-13",
      artist: "daft punk",
      title: "discovery",
      tracks: discoveryTracks,
    },
    {
      id: FOUR_EVR_PATCH_ID,
      recordId: "excel-vinyl-31",
      artist: "isoknock",
      title: "4evr",
      tracks: fourEvrTracks,
    },
  ]) {
    snapshot = applyAlbumPatch(snapshot, patch);
  }
  return snapshot;
}

function applyAlbumPatch(snapshot, patch) {
  if (snapshot.appliedDataPatches?.includes(patch.id)) return snapshot;
  const index = snapshot.records.findIndex(
    (r) =>
      r.id === patch.recordId &&
      r.artist.toLowerCase() === patch.artist &&
      r.title.toLowerCase() === patch.title,
  );
  if (index < 0) return snapshot;
  const album = snapshot.records[index];
  const tracks = album.tracks.map((t) => ({ ...t }));
  for (const incoming of patch.tracks) {
    const existing = tracks.find(
      (t) =>
        t.id === incoming.id ||
        (t.title.trim().toLowerCase() === incoming.title.toLowerCase() &&
          (!t.version || !incoming.version || t.version === incoming.version)),
    );
    if (!existing) tracks.push({ ...incoming });
    else {
      // Preserve IDs used by decks/setlists and existing user-entered values.
      for (const [key, value] of Object.entries(incoming)) {
        if (key !== "id" && (existing[key] == null || existing[key] === ""))
          existing[key] = value;
      }
    }
  }
  const records = snapshot.records.map((r, i) =>
    i === index ? { ...r, tracks } : r,
  );
  return {
    ...snapshot,
    records,
    appliedDataPatches: [
      ...(snapshot.appliedDataPatches || []),
      patch.id,
    ],
  };
}
