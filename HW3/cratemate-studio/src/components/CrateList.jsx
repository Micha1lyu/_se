import { CAMELOT_KEYS } from "../utils/records.js";
import { Search, Plus } from "lucide-react";
import CrateStats from "./CrateTab/CrateStats.jsx";
import RecordCard from "./CrateTab/RecordCard.jsx";
import AddRecordForm from "./CrateTab/AddRecordForm.jsx";

export default function CrateList({
  crateStats,
  records,
  searchQuery,
  setSearchQuery,
  setSelectedGenre,
  selectedGenre,
  selectedCamelot,
  setSelectedCamelot,
  setShowAddModal,
  showAddModal,
  handleAddRecord,
  formError,
  newRec,
  setNewRec,
  filteredRecords,
  handleSaveTrack,
  handleSpinRecord,
  handleCleanRecord,
  setDeckAId,
  setActiveTab,
  setDeckBId,
  addToSetlist,
}) {
  return (
    <div className="space-y-6">
      {/* 頂部四大數據儀表卡片 */}
      <CrateStats crateStats={crateStats} recordCount={records.length} />

      {/* 搜尋、曲風過濾與新增黑膠工具列 */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* 關鍵字搜尋 */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋藝人、專輯、主打單曲或壓片版本 (例如: Justice, 4EVR, OBI)..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          {/* 曲風分類過濾 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              "ALL",
              ...new Set(
                records.flatMap((r) =>
                  r.tracks.map((t) => t.genre).filter(Boolean),
                ),
              ),
            ].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedGenre === g
                    ? "bg-amber-500 text-black font-semibold shadow-sm shadow-amber-500/30"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                }`}
              >
                {g === "ALL" ? "全部曲風" : g}
              </button>
            ))}
          </div>

          {/* Camelot Key 快速篩選 */}
          <select
            value={selectedCamelot}
            onChange={(e) => setSelectedCamelot(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">所有調性 (Camelot Key)</option>
            {CAMELOT_KEYS.map((k) => (
              <option key={k} value={k}>
                Camelot {k}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/15 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>新增黑膠入庫</span>
        </button>
      </div>

      {/* 新增黑膠表單 Modal */}
      {showAddModal && (
        <AddRecordForm
          setShowAddModal={setShowAddModal}
          handleAddRecord={handleAddRecord}
          formError={formError}
          newRec={newRec}
          setNewRec={setNewRec}
        />
      )}

      {filteredRecords.length === 0 && (
        <p className="text-zinc-400">沒有符合條件的唱片，請調整搜尋或篩選。</p>
      )}
      {/* 黑膠唱片卡片網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecords.map((rec) => (
          <RecordCard
            key={rec.id}
            rec={rec}
            onSaveTrack={handleSaveTrack}
            onSpin={handleSpinRecord}
            onClean={handleCleanRecord}
            onLoadDeckA={(id) => {
              setDeckAId(id);
              setActiveTab("mixer");
            }}
            onLoadDeckB={(id) => {
              setDeckBId(id);
              setActiveTab("mixer");
            }}
            onAddToSetlist={addToSetlist}
          />
        ))}
      </div>
    </div>
  );
}
