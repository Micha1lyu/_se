import records from "./vinylCollection.json" with { type: "json" };
import { applyTrackPatches } from "./trackPatches.js";
export const COLLECTION_REVISION = "excel-vinyl-2026-10";
export const INITIAL_RECORDS = applyTrackPatches({ records }).records;
