import { formatTWD } from "../../utils/money.js";
import { DollarSign, Disc, AlertTriangle, Sparkles } from "lucide-react";

export default function CrateStats({ crateStats, recordCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 收藏總市值 */}
      <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>收藏總市值（未連接行情）</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {formatTWD(crateStats.totalValTWD)}
          </span>
          <span className="text-xs font-mono text-emerald-400">
            {crateStats.unknownValueCount} 張市值未知
          </span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>已知購入成本：{formatTWD(crateStats.totalCostTWD)}</span>
          <span className={`text-zinc-400 font-mono font-semibold`}>
            {crateStats.unknownCostCount} 張購入價未知
          </span>
        </div>
      </div>

      {/* 館藏壓片與轉速規格 */}
      <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>館藏壓片與轉速規格</span>
          <Disc className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-2xl font-bold font-mono text-white">
            {recordCount}{" "}
            <span className="text-sm font-normal text-zinc-400">張黑膠</span>
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {crateStats.rpmLabel}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400">
          每張收藏可登錄多首歌曲與實體碟片位置
        </div>
      </div>

      {/* 清潔提醒 */}
      <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>超音波洗片與靜電刷提醒</span>
          <AlertTriangle
            className={`w-4 h-4 ${
              crateStats.needsCleaningCount > 0
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {crateStats.needsCleaningCount}{" "}
            <span className="text-sm font-normal text-zinc-400">張待清潔</span>
          </span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400">
          依已記錄的播放次數提醒；匯入前清潔歷史未知
        </div>
      </div>

      {/* Muse Spark 索引 */}
      <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>歌曲資料完整度</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-cyan-300">
            {crateStats.keyedTrackCount ?? 0}/{crateStats.trackCount ?? 0} 首
          </span>
          <span className="text-xs text-zinc-400">已有 Camelot 調性</span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400">
          支援一鍵送入雙唱盤計算 Pitch % 與混音路徑
        </div>
      </div>
    </div>
  );
}
