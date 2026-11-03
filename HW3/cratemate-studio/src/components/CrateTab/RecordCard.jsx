import { formatTWD } from "../../utils/money.js";
import { useState } from "react";
import { valueChange } from "../../utils/records.js";
import TrackEditor from "./TrackEditor.jsx";

export default function RecordCard({
  rec,
  onSpin,
  onClean,
  onLoadDeckA,
  onLoadDeckB,
  onAddToSetlist,
  onSaveTrack,
}) {
  const [selectedId, setSelectedId] = useState("");
  const selected = rec.tracks.find((t) => t.id === selectedId) || rec.tracks[0];
  const change = valueChange(rec.buyPriceTWD, rec.currentValTWD, 0);
  return (
    <article
      className={
        "rounded-2xl border border-zinc-700 bg-gradient-to-b " +
        rec.coverGradient +
        " p-5 space-y-3"
      }
    >
      <div className="flex justify-between text-xs text-zinc-400">
        <span>
          {rec.artist || "藝人未註明"} • {rec.year ?? "發行年份未知"}
        </span>
        <span>{rec.rpm === 45 ? "45" : "33⅓"} RPM</span>
      </div>
      <h3 className="font-bold text-lg">{rec.title}</h3>
      <dl className="text-xs space-y-2 bg-black/40 rounded-lg p-3">
        <div>
          <dt className="text-zinc-500">壓片版本</dt>
          <dd>{rec.pressing}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">品相 (Media / Sleeve)</dt>
          <dd>
            碟 {rec.conditionMedia || "未知"} ／ 封{" "}
            {rec.conditionSleeve || "未知"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">購入價／現值</dt>
          <dd>
            {formatTWD(rec.buyPriceTWD)} ／ {formatTWD(rec.currentValTWD)}{" "}
            <span className={change.color}>{change.text}</span>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">購買日期／地點</dt>
          <dd>
            {rec.purchaseDate || "日期未知"} ／{" "}
            {rec.purchaseLocation || "地點未知"}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-zinc-400">{rec.notes}</p>
      <div className="text-xs space-y-2">
        <p>
          播放紀錄：{rec.playHistoryKnown === false ? "未知；匯入後 " : ""}
          {rec.playCount} 次 ·{" "}
          {rec.playsSinceClean >= 8 ? "待深層洗片" : "距上次清潔"}{" "}
          {rec.playsSinceClean}/8 次
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => onSpin(rec.id)}>
            記錄播放 +1
          </button>
          <button type="button" onClick={() => onClean(rec.id)}>
            已清潔
          </button>
        </div>
      </div>
      <section className="border-t border-zinc-700 pt-3 space-y-2 text-xs">
        <label className="block">
          專輯內歌曲（{rec.tracks.length} 首）
          <select
            aria-label={rec.title + " 歌曲"}
            value={selected?.id || ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-2 w-full bg-zinc-950 border border-zinc-700 rounded p-2"
          >
            {!rec.tracks.length && <option value="">尚未新增歌曲</option>}
            {rec.tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.side}
                {t.position} {t.title}
                {t.version ? " — " + t.version : ""}
              </option>
            ))}
          </select>
        </label>
        {selected && (
          <p className="text-zinc-400">
            {selected.bpm ?? "未知"} BPM · {selected.camelot || "調性未知"} ·{" "}
            {selected.genre || "曲風未知"} ·{" "}
            {selected.discNumber ? "碟 " + selected.discNumber : "碟片未確認"}{" "}
            {selected.side}
            {selected.position}
            {selected.duration ? " · " + selected.duration : ""}
            {selected.metadataStatus === "legacy-unverified"
              ? " · 舊資料待核對"
              : ""}
          </p>
        )}
        {selected?.vinylAudioVerified === false && (
          <p className="text-zinc-500">
            BPM、調性與曲風取自你提供的數位版本截圖，尚未實測黑膠音訊。
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <button
            disabled={!selected}
            onClick={() => onLoadDeckA(selected.id)}
            className="bg-zinc-800 rounded p-2 disabled:opacity-30"
          >
            載入 Deck A
          </button>
          <button
            disabled={!selected}
            onClick={() => onLoadDeckB(selected.id)}
            className="bg-zinc-800 rounded p-2 disabled:opacity-30"
          >
            載入 Deck B
          </button>
          <button
            disabled={!selected}
            onClick={() => onAddToSetlist(selected)}
            className="bg-zinc-800 rounded p-2 disabled:opacity-30"
          >
            + 排入歌單
          </button>
        </div>
      </section>
      <TrackEditor
        record={rec}
        onSave={(track) => onSaveTrack(rec.id, track)}
      />
    </article>
  );
}
