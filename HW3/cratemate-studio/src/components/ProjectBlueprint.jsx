import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Check,
  Download,
  Copy,
  Terminal,
  Sparkles,
} from "lucide-react";

export default function ProjectBlueprint({
  handleCopyContent,
  handleExport,
  handleExportPrevious,
  handleExportCleanup,
  copiedType,
  openCodeScript,
}) {
  return (
    <div className="space-y-6">
      {/* 直接回應題目：使用價值 vs 商業價值 雙核心剖析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. 使用價值 (User Value) */}
        <div className="bg-zinc-900/85 border border-amber-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              維度一：使用價值 (High Personal & Community Utility)
            </span>
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>

          <h3 className="text-lg font-bold text-white">
            自己就是重度使用者，同時解決全球黑膠復甦潮的真實痛點
          </h3>

          <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">
                  告別盲目翻找唱片 (解決選歌與對拍斷層)：
                </strong>
                傳統 Discogs 只能查價格，卻沒有標記 BPM、Camelot 調性與 33/45
                轉速。本系統讓玩家在家練盤或派對演出前，一秒算出兩張黑膠需要推多少{" "}
                <code className="text-amber-300 font-mono">% Pitch</code>{" "}
                才能無縫混音。
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">
                  保護高價絕版黑膠與唱針資產：
                </strong>
                限量彩膠（如 ISOxo & Knock2、日版 OBI
                側標）動輒破台幣三四千元。系統內建「播放滿 8
                次洗片提醒」與「唱針 1,000 小時壽命追蹤」，防止磨損珍貴溝槽。
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">
                  台灣/亞洲在地化硬體安全痛點：
                </strong>
                針對日規 100V 唱盤在台灣 115V
                電壓環境下的降壓監控，以及小坪數房間聲學駐波計算，真正具備日常高頻率打開使用的價值。
              </div>
            </li>
          </ul>
        </div>

        {/* 2. 商業價值 (Commercial Value) */}
        <div className="bg-zinc-900/85 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              維度二：商業價值 (SaaS Monetization & B2B Freelance)
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>

          <h3 className="text-lg font-bold text-white">
            可立即變現的垂直 SaaS 訂閱制 + 實體黑膠唱片行接案模組
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
              <div className="text-xs font-mono text-amber-400 font-bold">
                模式 A：B2C 垂直訂閱
              </div>
              <div className="text-sm font-bold text-white">$9 USD / 月</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                針對全球 DJ 與黑膠藏家提供無限雲端備份、Discogs 自動漲跌推播與
                Muse Spark 1.3 自動排歌功能。
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
              <div className="text-xs font-mono text-cyan-400 font-bold">
                模式 B：B2B 接案客製
              </div>
              <div className="text-sm font-bold text-white">
                NT$ 80k - 150k / 案
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                為台灣獨立黑膠唱片行、Listening Bar
                (聽膠酒吧)、二手音響店導入「智慧試聽與庫存詢價 iPad 導購系統」。
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
              <div className="text-xs font-mono text-emerald-400 font-bold">
                模式 C：分潤與硬體導購
              </div>
              <div className="text-sm font-bold text-white">
                Affiliate 8%~15%
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                當唱針壽命達 800 小時或待洗片數超標時，精準推播替換唱針
                (Ortofon/Nagaoka) 與洗片機購買連結。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI 技術架構：OpenCode + Big Pickle 與 Muse Spark 1.3 協同流水線 */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>
                AI 雙引擎架構：OpenCode + Big Pickle × Muse Spark 1.3 技術整合
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              將開源代理開發流程與專業音樂聲學推理模型結合，大幅降低 80%
              開發與維護成本
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPrevious}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300"
            >
              下載匯入前收藏備份
            </button>
            <button
              onClick={handleExportCleanup}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300"
            >
              下載清理前收藏備份
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>下載完整 JSON 備份</span>
            </button>

            <button
              onClick={() => handleCopyContent("cli", openCodeScript)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              {copiedType === "cli" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">已複製腳本</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製 OpenCode 部署腳本</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="bg-zinc-950 border border-cyan-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-cyan-300">
                <Terminal className="w-4 h-4" />
                <span>
                  1. OpenCode + Big Pickle (後端資料爬蟲與零延遲序列化)
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs">
                透過 <code className="text-cyan-300">OpenCode</code>{" "}
                代理自動生成與維護 Discogs API 價格爬蟲及壓片矩陣碼 (Matrix
                Runout) 比對邏輯；並藉由{" "}
                <code className="text-cyan-300">Big Pickle</code>{" "}
                高效序列化收藏家的本地物件樹與歷史行情快照，確保在無網路的地下俱樂部或派對現場也能零延遲載入完整歌庫。
              </p>
            </div>

            <div className="bg-zinc-950 border border-amber-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>2. Muse Spark 1.3 (音訊特徵提取與混音排歌推理引擎)</span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs">
                由 <code className="text-amber-300">Muse Spark 1.3</code>{" "}
                負責解析每張黑膠曲目的調性中心 (Camelot Wheel)、節拍瞬態能量
                (Transient Energy) 與曲式段落 (Phrase Structure)，針對不同轉速與
                BPM 落差自動生成專業 DJ 等級的 EQ 與 Filter 過渡指導。
              </p>
            </div>
          </div>

          {/* 程式碼預覽區塊 */}
          <div className="bg-[#07080b] border border-zinc-800 rounded-xl p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto">
            <pre className="leading-relaxed">{openCodeScript}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
