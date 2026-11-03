import { collectionStats } from "./utils/money.js";
import { INITIAL_RECORDS } from "./data/records.js";
import { TRACK_PATCH_IDS } from "./data/trackPatches.js";
import { flattenTracks } from "./utils/collection.js";
import { analyzeMix } from "./utils/mixing.js";
import { defaultRecord, normalizeRecord } from "./utils/records.js";
import {
  loadTrackedCollection,
  TRACKED_COLLECTION_REVISION,
  saveSnapshot,
  readPreviousBackup,
  readEmptyRecordCleanupBackup,
} from "./utils/storage.js";
import { copyText, downloadSnapshot } from "./utils/io.js";
import AppHeader from "./components/AppHeader.jsx";
import CrateList from "./components/CrateList.jsx";
import MixerDeck from "./components/MixerDeck.jsx";
import HardwareMonitor from "./components/HardwareMonitor.jsx";
import ProjectBlueprint from "./components/ProjectBlueprint.jsx";
import { useState, useMemo, useEffect, useRef } from "react";

// ==========================================
// 主應用程式組件
// ==========================================
export default function App() {
  const [loaded] = useState(() => loadTrackedCollection());
  const saved = loaded.data;
  const [storageError, setStorageError] = useState(
    loaded.error || loaded.notice || "",
  );
  const [actionError, setActionError] = useState("");
  const [formError, setFormError] = useState("");
  const copyTimer = useRef(null);
  const copyRequest = useRef(0);
  const [activeTab, setActiveTab] = useState("crate");
  const [records, setRecords] = useState(
    () => saved?.records ?? INITIAL_RECORDS.filter((record) => record.tracks.length > 0),
  );
  const tracks = useMemo(() => flattenTracks(records), [records]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedCamelot, setSelectedCamelot] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // 新增黑膠表單狀態
  const [newRec, setNewRec] = useState(defaultRecord);

  // Tab 2: 雙唱盤混音狀態 (Deck A & Deck B)
  const [deckAId, setDeckAId] = useState(saved?.deckAId ?? tracks[0]?.id ?? ""); // Justice (122 BPM, 8A)
  const [deckBId, setDeckBId] = useState(
    saved?.deckBId ??
      tracks.find((t) => t.recordId !== tracks[0]?.recordId)?.id ??
      "",
  ); // Tame Impala (125 BPM, 9A)
  const [pitchRangeLimit, setPitchRangeLimit] = useState(
    saved?.pitchRangeLimit ?? 8,
  ); // ±8% or ±16% on SL-1200
  const [halfDoubleMode, setHalfDoubleMode] = useState(
    saved?.halfDoubleMode ?? false,
  );
  const [setlistIds, setSetlistIds] = useState(saved?.setlist ?? []);
  const setlist = setlistIds
    .map((id) => tracks.find((r) => r.id === id))
    .filter(Boolean);

  // Tab 3: 硬體唱頭與聲學監控狀態
  const [stylusHours, setStylusHours] = useState(
    saved?.hardware.stylusHours ?? 418,
  );
  const stylusMaxHours = 1000;
  const [trackingForce, setTrackingForce] = useState(
    saved?.hardware.trackingForce ?? 3.0,
  );
  const [cartridgeModel, setCartridgeModel] = useState(
    saved?.hardware.cartridgeModel ?? "Ortofon Concorde MKII Club (Elliptical)",
  );
  const [jpTransformerInput, setJpTransformerInput] = useState(
    saved?.hardware.jpTransformerInput ?? 115,
  ); // Taiwan wall socket 115V
  const [stepDownEnabled, setStepDownEnabled] = useState(
    saved?.hardware.stepDownEnabled ?? true,
  );
  const [roomWidth, setRoomWidth] = useState(saved?.hardware.roomWidth ?? 3.8);
  const speakerDist = Number((roomWidth * 0.48).toFixed(2));

  // Tab 4: 複製與匯出通知狀態
  const [copiedType, setCopiedType] = useState(null);

  // 篩選後的唱片列表
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tracks.some((t) =>
          (t.title + " " + t.version + " " + t.artist)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ) ||
        r.pressing.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre =
        selectedGenre === "ALL" ||
        r.tracks.some((t) => t.genre === selectedGenre);
      const matchesKey =
        (selectedCamelot === "ALL" && selectedGenre === "ALL") ||
        r.tracks.some(
          (t) =>
            (selectedCamelot === "ALL" || t.camelot === selectedCamelot) &&
            (selectedGenre === "ALL" || t.genre === selectedGenre),
        );
      return matchesSearch && matchesGenre && matchesKey;
    });
  }, [records, searchQuery, selectedGenre, selectedCamelot]);

  // 資產統計計算
  const crateStats = useMemo(() => collectionStats(records), [records]);

  // Deck A & Deck B 混音計算
  const deckA = useMemo(
    () => tracks.find((r) => r.id === deckAId),
    [tracks, deckAId],
  );
  const deckB = useMemo(
    () => tracks.find((r) => r.id === deckBId),
    [tracks, deckBId],
  );

  const mixAnalysis = useMemo(
    () =>
      deckA && deckB
        ? analyzeMix(deckA, deckB, pitchRangeLimit, halfDoubleMode)
        : null,
    [deckA, deckB, pitchRangeLimit, halfDoubleMode],
  );
  const snapshot = useMemo(
    () => ({
      version: 3,
      collectionRevision: TRACKED_COLLECTION_REVISION,
      appliedDataPatches:
        saved?.appliedDataPatches ?? (saved ? [] : TRACK_PATCH_IDS),
      records,
      setlist: setlistIds,
      deckAId,
      deckBId,
      pitchRangeLimit,
      halfDoubleMode,
      hardware: {
        stylusHours,
        trackingForce,
        cartridgeModel,
        jpTransformerInput,
        stepDownEnabled,
        roomWidth,
      },
    }),
    [
      records,
      saved,
      setlistIds,
      deckAId,
      deckBId,
      pitchRangeLimit,
      halfDoubleMode,
      stylusHours,
      trackingForce,
      cartridgeModel,
      jpTransformerInput,
      stepDownEnabled,
      roomWidth,
    ],
  );
  useEffect(() => {
    if (loaded.error) return;
    let active = true;
    saveSnapshot(snapshot).catch(() => {
      if (active)
        setStorageError(
          "本機儲存失敗，重新整理可能遺失變更。請使用 JSON 匯出備份。",
        );
    });
    return () => {
      active = false;
    };
  }, [snapshot, loaded.error]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // 操作處理函數：播放黑膠 (+1 次數 & 同步增加唱針時數)
  const handleSpinRecord = (id) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              playCount: r.playCount + 1,
              playsSinceClean: r.playsSinceClean + 1,
            }
          : r,
      ),
    );
    setStylusHours((h) => Number((h + 0.4).toFixed(1)));
  };

  // 操作處理函數：清潔黑膠 (重置未清潔播放計數)
  const handleCleanRecord = (id) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, playsSinceClean: 0 } : r)),
    );
  };

  // 操作處理函數：新增黑膠入櫃
  const handleAddRecord = (e) => {
    e.preventDefault();
    try {
      const created = normalizeRecord(newRec, "rec-" + crypto.randomUUID());
      setRecords((prev) => [created, ...prev]);
      setNewRec(defaultRecord());
      setFormError("");
      setShowAddModal(false);
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleSaveTrack = (recordId, track) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id !== recordId
          ? record
          : {
              ...record,
              tracks: record.tracks.some((t) => t.id === track.id)
                ? record.tracks.map((t) => (t.id === track.id ? track : t))
                : [...record.tracks, track],
            },
      ),
    );
  };

  // 加入排歌清單
  const addToSetlist = (rec) => {
    setSetlistIds((prev) => [...prev, rec.id]);
  };

  const removeFromSetlist = (idx) => {
    setSetlistIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCopyContent = async (type, text) => {
    const request = ++copyRequest.current;
    clearTimeout(copyTimer.current);
    setCopiedType(null);
    setActionError("");
    try {
      await copyText(text);
      if (request !== copyRequest.current) return;
      setCopiedType(type);
      copyTimer.current = setTimeout(() => setCopiedType(null), 2500);
    } catch {
      if (request === copyRequest.current)
        setActionError("複製失敗，請允許剪貼簿權限後再試。");
    }
  };
  const handleExport = () => {
    setActionError("");
    try {
      downloadSnapshot(snapshot);
    } catch {
      setActionError("無法產生 JSON 檔案，請稍後重試。");
    }
  };
  const handleExportPrevious = (readBackup = readPreviousBackup) => {
    setActionError("");
    try {
      downloadSnapshot(readBackup());
    } catch (error) {
      setActionError(`收藏備份下載失敗：${error.message}`);
    }
  };

  const openCodeScript = `# ====================================================================
# CrateMate Studio — OpenCode + Big Pickle & Muse Spark 1.3 CLI Workflow
# ====================================================================
import pickle
import json
from datetime import datetime

class CrateMateSerializer:
    """
    利用 Big Pickle 封裝本地黑膠資料庫、Discogs 價格歷史與 Muse Spark 1.3 特徵向量
    解決個人收藏家隱私與離線演出零延遲 (Zero-Latency) 讀取需求
    """
    def __init__(self, crate_data, stylus_telemetry):
        self.version = "CrateMate-v2.6-MuseSpark1.3"
        self.timestamp = datetime.now().isoformat()
        self.crate_data = crate_data
        self.stylus_telemetry = stylus_telemetry

    def export_big_pickle(self, filepath="cratemate_vault.pkl"):
        payload = {
            "meta": {"engine": self.version, "exported_at": self.timestamp},
            "records": self.crate_data,
            "hardware": self.stylus_telemetry
        }
        with open(filepath, "wb") as f:
            pickle.dump(payload, f, protocol=pickle.HIGHEST_PROTOCOL)
        return f"[OK] Big Pickle 狀態快照已寫入: {filepath}"

# OpenCode 自動生成命令:
# $ opencode agent run --model big-pickle --plugin muse-spark-1.3 --sync-discogs`;

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 頂部工業風硬體狀態導覽列 */}
      <AppHeader
        crateStats={crateStats}
        records={records}
        stylusHours={stylusHours}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 主要內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {(storageError || actionError) && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-amber-500/40 p-3 text-sm text-amber-300"
          >
            {storageError}
            {storageError && actionError ? " " : ""}
            {actionError}
          </div>
        )}
        {/* ============================================================
            TAB 1: 黑膠唱片櫃與身價追蹤 (Vinyl Crate & Valuation)
           ============================================================ */}
        {activeTab === "crate" && (
          <CrateList
            crateStats={crateStats}
            records={records}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSelectedGenre={setSelectedGenre}
            selectedGenre={selectedGenre}
            selectedCamelot={selectedCamelot}
            setSelectedCamelot={setSelectedCamelot}
            setShowAddModal={setShowAddModal}
            showAddModal={showAddModal}
            handleAddRecord={handleAddRecord}
            formError={formError}
            newRec={newRec}
            setNewRec={setNewRec}
            filteredRecords={filteredRecords}
            handleSaveTrack={handleSaveTrack}
            handleSpinRecord={handleSpinRecord}
            handleCleanRecord={handleCleanRecord}
            setDeckAId={setDeckAId}
            setActiveTab={setActiveTab}
            setDeckBId={setDeckBId}
            addToSetlist={addToSetlist}
          />
        )}

        {/* ============================================================
            TAB 2: 智慧混音排歌與轉速計算機 (Harmonic Set Builder & Pitch Calc)
           ============================================================ */}
        {activeTab === "mixer" && (
          <MixerDeck
            tracks={tracks}
            deckAId={deckAId}
            setDeckAId={setDeckAId}
            records={records}
            deckA={deckA}
            setPitchRangeLimit={setPitchRangeLimit}
            pitchRangeLimit={pitchRangeLimit}
            mixAnalysis={mixAnalysis}
            setHalfDoubleMode={setHalfDoubleMode}
            halfDoubleMode={halfDoubleMode}
            deckBId={deckBId}
            setDeckBId={setDeckBId}
            deckB={deckB}
            setlist={setlist}
            removeFromSetlist={removeFromSetlist}
          />
        )}

        {/* ============================================================
            TAB 3: 硬體校準與唱頭壽命監控 (Turntable & Stylus Telemetry)
           ============================================================ */}
        {activeTab === "hardware" && (
          <HardwareMonitor
            cartridgeModel={cartridgeModel}
            setCartridgeModel={setCartridgeModel}
            setTrackingForce={setTrackingForce}
            stylusHours={stylusHours}
            stylusMaxHours={stylusMaxHours}
            trackingForce={trackingForce}
            setStylusHours={setStylusHours}
            stepDownEnabled={stepDownEnabled}
            jpTransformerInput={jpTransformerInput}
            setJpTransformerInput={setJpTransformerInput}
            setStepDownEnabled={setStepDownEnabled}
            roomWidth={roomWidth}
            setRoomWidth={setRoomWidth}
            speakerDist={speakerDist}
          />
        )}

        {/* ============================================================
            TAB 4: 專案價值與 AI 商業藍圖 (Business & AI Architecture Blueprint)
           ============================================================ */}
        {activeTab === "blueprint" && (
          <ProjectBlueprint
            handleCopyContent={handleCopyContent}
            handleExport={handleExport}
            handleExportPrevious={() => handleExportPrevious()}
            handleExportCleanup={() => handleExportPrevious(readEmptyRecordCleanupBackup)}
            copiedType={copiedType}
            openCodeScript={openCodeScript}
          />
        )}
      </main>
    </div>
  );
}
