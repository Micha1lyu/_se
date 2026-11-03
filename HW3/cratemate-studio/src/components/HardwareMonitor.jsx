import { Activity, Zap, Volume2 } from "lucide-react";

export default function HardwareMonitor({
  cartridgeModel,
  setCartridgeModel,
  setTrackingForce,
  stylusHours,
  stylusMaxHours,
  trackingForce,
  setStylusHours,
  stepDownEnabled,
  jpTransformerInput,
  setJpTransformerInput,
  setStepDownEnabled,
  roomWidth,
  setRoomWidth,
  speakerDist,
}) {
  const worn = stylusHours >= stylusMaxHours;
  const needsInspection = stylusHours >= 800;
  const outputVoltage = stepDownEnabled
    ? jpTransformerInput * (100 / 115)
    : jpTransformerInput;
  const voltageOk = outputVoltage >= 95 && outputVoltage <= 105;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. 唱頭與鑽石唱針磨損壽命追蹤 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  唱針磨損時數與針壓校準
                </h3>
              </div>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${needsInspection ? "text-rose-400 border-rose-500/40" : "text-emerald-300 border-emerald-500/30"}`}
              >
                {worn
                  ? "已達建議壽命，請檢查或更換"
                  : needsInspection
                    ? "接近建議壽命，請檢查唱針"
                    : "時數低於檢查門檻（未檢測磨損）"}
              </span>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                目前服役唱頭型號:
              </label>
              <select
                value={cartridgeModel}
                onChange={(e) => {
                  setCartridgeModel(e.target.value);
                  if (e.target.value.includes("Club")) setTrackingForce(3.0);
                  else if (e.target.value.includes("Nagaoka"))
                    setTrackingForce(1.8);
                  else setTrackingForce(2.0);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-white"
              >
                <option value="Ortofon Concorde MKII Club (Elliptical)">
                  Ortofon Concorde MKII Club (8mV 俱樂部旗艦)
                </option>
                <option value="Nagaoka MP-110 (Hi-Fi Warm Audiophile)">
                  Nagaoka MP-110 (日本手工溫暖人聲首選)
                </option>
                <option value="Audio-Technica VM540ML (MicroLine)">
                  Audio-Technica VM540ML (微線型高解析唱頭)
                </option>
              </select>
            </div>

            {/* 壽命進度條 */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">累計循跡播放時數:</span>
                <span className="font-mono font-bold text-amber-400">
                  {stylusHours} / {stylusMaxHours} hrs (
                  {((stylusHours / stylusMaxHours) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    needsInspection
                      ? "bg-rose-500"
                      : "bg-gradient-to-r from-emerald-400 to-amber-400"
                  }`}
                  style={{
                    width: `${Math.min(100, (stylusHours / stylusMaxHours) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                唱針超過 800
                小時後高頻解析度會開始衰退並加速黑膠溝槽磨損。在「唱片櫃」點擊播放會自動累加時數。
              </p>
            </div>

            {/* 針壓與抗滑同步計算 */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300">
                  設定針壓 (Tracking Force):
                </span>
                <span className="font-mono text-sm font-bold text-cyan-300">
                  {trackingForce.toFixed(1)} g
                </span>
              </div>
              <input
                type="range"
                min="1.2"
                max="4.0"
                step="0.1"
                value={trackingForce}
                onChange={(e) => setTrackingForce(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-900">
                <span>建議 Anti-Skating (抗滑偏壓):</span>
                <span className="text-emerald-400 font-bold">
                  刻度 {trackingForce.toFixed(1)} (與針壓 1:1 同步)
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStylusHours((h) => Number((h + 2).toFixed(1)))}
              className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white"
            >
              + 記錄 2 小時練盤
            </button>
            <button
              onClick={() => setStylusHours(0)}
              className="py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-xs text-zinc-400 hover:text-amber-300"
            >
              更換新針歸零
            </button>
          </div>
        </div>

        {/* 2. 日本 100V 水貨器材降壓安全監控 (Step-Down Transformer Monitor) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  日規 100V 唱盤降壓安全監控
                </h3>
              </div>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  voltageOk
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                }`}
              >
                {`${outputVoltage.toFixed(1)}V ${voltageOk ? "估算範圍內" : "估算電壓異常"}`}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              台灣眾多黑膠玩家使用日規 Technics SL-1200MK3D/MK5 (AC
              100V)。若直接插台灣壁插
              (110V~116V)，會導致變壓器長期發熱、馬達扭力異常甚至燒毀穩壓 IC。
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">輸入電壓（手動設定）:</span>
                <span className="font-mono font-bold text-white">
                  {jpTransformerInput} V AC
                </span>
              </div>
              <input
                type="range"
                min="108"
                max="120"
                step="1"
                value={jpTransformerInput}
                onChange={(e) =>
                  setJpTransformerInput(parseInt(e.target.value, 10))
                }
                className="w-full accent-cyan-400"
              />

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                <span className="text-xs text-zinc-300">
                  串接 115V ➔ 100V 隔離降壓器:
                </span>
                <button
                  onClick={() => setStepDownEnabled(!stepDownEnabled)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    stepDownEnabled
                      ? "bg-emerald-500 text-black"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {stepDownEnabled ? "已開啟降壓 (ON)" : "未接降壓器 (BYPASS)"}
                </button>
              </div>
            </div>

            <div
              className={`rounded-xl p-3.5 border text-xs leading-relaxed ${
                voltageOk
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-200"
              }`}
            >
              <strong>
                {voltageOk
                  ? "估算電壓落在 95–105V 提示範圍內。"
                  : "估算電壓超出 95–105V 提示範圍。"}
              </strong>
              <span>
                以固定變比 115:100 計算，輸出約 {outputVoltage.toFixed(1)}
                V。此為模擬值，請依器材標示與實際量測確認供電；不是硬體安全認證。
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <span>接地與哼聲：未連接感測器</span>
            <span>請人工檢查</span>
          </div>
        </div>

        {/* 3. 空間聲學與黑膠低頻回授共振計算機 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  空間擺位與駐波防回授計算
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-300">
                正三角形甜區
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              黑膠唱頭極易受到喇叭低頻震動影響而產生「Acoustic Feedback
              (低頻轟鳴回授)」。透過房間寬度自動計算最佳擺位與駐波頻率。
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">聆聽空間寬度 (公尺):</span>
                  <span className="font-mono font-bold text-white">
                    {roomWidth} m
                  </span>
                </div>
                <input
                  type="range"
                  min="2.4"
                  max="6.5"
                  step="0.1"
                  value={roomWidth}
                  onChange={(e) => {
                    const w = parseFloat(e.target.value);
                    setRoomWidth(w);
                  }}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-xs">
                <div className="bg-zinc-900/80 p-2.5 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">
                    建議左右喇叭間距
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    {speakerDist} m
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-2.5 rounded-lg">
                  <div className="text-zinc-400 text-[11px]">
                    皇帝位聆聽垂直距離
                  </div>
                  <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                    {(speakerDist * 0.866).toFixed(2)} m
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-lg flex items-center justify-between text-xs">
                <span className="text-zinc-400">第一軸向低頻駐波頻率:</span>
                <span className="font-mono font-bold text-rose-400">
                  {(343 / (2 * roomWidth)).toFixed(1)} Hz (建議開啟 Subsonic
                  濾波)
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 bg-zinc-950/90 border border-zinc-800 rounded-lg p-3">
            💡 <strong>硬體防震建議：</strong>
            請勿將監聽喇叭與黑膠唱盤放置於同一張桌面上，或於唱盤下方加裝
            Sorbothane 阻尼避震墊。
          </div>
        </div>
      </div>
    </div>
  );
}
