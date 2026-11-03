import { formatTWD } from "../utils/money.js";
import {
  Disc,
  Cpu,
  Sparkles,
  TrendingUp,
  Sliders,
  Activity,
} from "lucide-react";

export default function AppHeader({
  crateStats,
  records,
  stylusHours,
  activeTab,
  setActiveTab,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/90 bg-[#0d0f14]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* 品牌識別與唱盤轉速指示燈 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border-2 border-amber-500/60 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Disc
                className="w-6 h-6 text-amber-400 animate-spin"
                style={{ animationDuration: "8s" }}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-black"
                title="Quartz Lock Active"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  CrateMate{" "}
                  <span className="text-amber-400 font-mono">STUDIO</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded">
                  QUARTZ LOCK SL-1200 MK7
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                黑膠收藏身價管理 × 智慧混音排歌與唱頭硬體監控工作台
              </p>
            </div>
          </div>

          {/* 手機版快速資產膠囊 */}
          <div className="flex lg:hidden items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {formatTWD(crateStats.totalCostTWD)}
            </span>
          </div>
        </div>

        {/* AI 雙核心與硬體即時遙測資訊列 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">Code & State:</span>
            <span className="font-mono text-cyan-300 font-medium">
              OpenCode + Big Pickle
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Audio AI:</span>
            <span className="font-mono text-amber-300 font-medium">
              Muse Spark 1.3
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-950/30 border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-300">已知購入成本:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatTWD(crateStats.totalCostTWD)}
            </span>
            <span
              className={`text-[11px] font-mono bg-zinc-800 px-1.5 py-0.2 rounded text-zinc-300`}
            >
              {crateStats.unknownCostCount} 張購入價未知
            </span>
          </div>
        </div>
      </div>

      {/* 四大核心功能切換頁籤 (Navigation Tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar border-t border-zinc-800/60 bg-[#0b0d12]">
        {[
          {
            id: "crate",
            label: "1. 黑膠唱片櫃與身價追蹤",
            sub: "Vinyl Crate & Valuation",
            icon: Disc,
            badge: `${records.length} LPs`,
          },
          {
            id: "mixer",
            label: "2. 智慧混音排歌與轉速計算",
            sub: "Harmonic Set & Pitch Calc",
            icon: Sliders,
            badge: "Muse 1.3",
          },
          {
            id: "hardware",
            label: "3. 硬體校準與唱頭壽命監控",
            sub: "Stylus & 100V Telemetry",
            icon: Activity,
            badge: `${stylusHours}h`,
          },
          {
            id: "blueprint",
            label: "4. 專案價值與 AI 商業藍圖",
            sub: "Value & SaaS Architecture",
            icon: Cpu,
            badge: "ROI 模型",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2.5 px-4 py-3 text-left border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-amber-400 bg-amber-500/10 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? "text-amber-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
              <div>
                <div className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 hidden md:block">
                  {tab.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
}
