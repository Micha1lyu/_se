import { useState } from "react";
import { analyzeMix } from "../utils/mixing.js";
import { physicalConflict } from "../utils/collection.js";

function DeckTrackSelector({ name, records, tracks, selected, id, onSelect }) {
  const [albumId, setAlbumId] = useState("");
  const recordId = selected?.recordId ?? albumId;
  const album = records.find((record) => record.id === recordId);
  const albumTracks = album
    ? tracks.filter((track) => track.recordId === album.id)
    : [];
  const selectClass =
    "mt-2 w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-white disabled:opacity-50";

  return (
    <>
      <label className="block text-xs text-zinc-400">
        選擇專輯
        <select
          aria-label={"Deck " + name + " 專輯"}
          value={album?.id ?? ""}
          onChange={(event) => {
            setAlbumId(event.target.value);
            onSelect("");
          }}
          className={selectClass}
        >
          <option value="">請選擇專輯</option>
          {records.map((record) => (
            <option key={record.id} value={record.id}>
              {record.artist} — {record.title}
              {record.tracks.length === 0 ? "（尚未新增歌曲）" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs text-zinc-400">
        選擇歌曲
        <select
          aria-label={"Deck " + name + " 歌曲"}
          value={selected?.recordId === album?.id ? id : ""}
          onChange={(event) => {
            setAlbumId(recordId);
            onSelect(event.target.value);
          }}
          disabled={albumTracks.length === 0}
          className={selectClass}
        >
          <option value="">
            {!album
              ? "請先選擇專輯"
              : albumTracks.length === 0
                ? "此專輯尚未新增歌曲"
                : "請選擇歌曲"}
          </option>
          {albumTracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.side}{track.position}
              {track.side || track.position ? " · " : ""}
              {track.title}
              {track.version ? " — " + track.version : ""}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export default function MixerDeck({
  records,
  tracks,
  deckA,
  deckB,
  deckAId,
  deckBId,
  setDeckAId,
  setDeckBId,
  pitchRangeLimit,
  setPitchRangeLimit,
  halfDoubleMode,
  setHalfDoubleMode,
  mixAnalysis,
  setlist,
  removeFromSetlist,
}) {
  const deck = (name, selected, id, onSelect) => (
    <section className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-3">
      <h3 className="text-amber-300 font-bold">{"DECK " + name}</h3>
      <DeckTrackSelector
        name={name}
        records={records}
        tracks={tracks}
        selected={selected}
        id={id}
        onSelect={onSelect}
      />
      {selected ? (
        <>
          <h4 className="font-bold">{selected.title}</h4>
          <p className="text-sm text-zinc-400">
            {selected.artist} · {selected.recordTitle}
          </p>
          <p className="text-sm">
            {selected.bpm ?? "未知"} BPM · {selected.camelot || "調性未知"} ·{" "}
            {selected.rpm === 45 ? "45" : "33⅓"} RPM
          </p>
          <p className="text-xs text-zinc-400">
            {selected.discNumber ? "碟 " + selected.discNumber : "碟片編號未知"}{" "}
            {selected.side}
            {selected.position} · {selected.version || "版本未註明"}
            {selected.duration ? " · " + selected.duration : ""}
          </p>
          {selected.vinylAudioVerified === false && (
            <p className="text-xs text-zinc-500">
              BPM／調性來自數位版本資料，未實測黑膠音訊。
            </p>
          )}
        </>
      ) : (
        <p className="text-zinc-400 text-sm">
          先在唱片櫃新增歌曲，再載入此唱盤。
        </p>
      )}
    </section>
  );
  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        混音與排歌使用歌曲資料；收藏價格與品相仍屬於整張唱片。
      </p>
      <div className="grid lg:grid-cols-2 gap-5">
        {deck("A", deckA, deckAId, setDeckAId)}
        {deck("B", deckB, deckBId, setDeckBId)}
      </div>
      <section className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <span>Pitch 範圍</span>
          {[8, 16].map((n) => (
            <button
              key={n}
              onClick={() => setPitchRangeLimit(n)}
              aria-pressed={n === pitchRangeLimit}
              className={
                "rounded px-3 py-1 " +
                (n === pitchRangeLimit
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-800")
              }
            >
              ±{n}%
            </button>
          ))}
          <button
            onClick={() => setHalfDoubleMode(!halfDoubleMode)}
            className="rounded bg-zinc-800 p-2"
          >
            倍速折算：{halfDoubleMode ? "ON" : "OFF"}
          </button>
        </div>
        {mixAnalysis ? (
          <>
            {mixAnalysis.blocked ? (
              <p role="status" className="text-amber-300">
                {mixAnalysis.reason}
              </p>
            ) : (
              <>
                <p className="text-xl font-mono">
                  Deck B → {mixAnalysis.effectiveTargetBpm} BPM · Pitch{" "}
                  {mixAnalysis.pitchDiffPercent.toFixed(2)}%
                </p>
                <p>音高偏移 {mixAnalysis.semitoneShift} 半音</p>
                <p className="text-amber-300">
                  {mixAnalysis.harmonic.label} ·{" "}
                  {mixAnalysis.harmonic.score === null
                    ? "未評分"
                    : mixAnalysis.harmonic.score + "% 近似契合"}
                </p>
                <p className="text-xs text-zinc-400">
                  {mixAnalysis.harmonic.advice}
                </p>
              </>
            )}
            <div className="space-y-2 text-xs text-zinc-400">
              {mixAnalysis.museAdvice.map((tip, i) => (
                <p key={i}>{tip}</p>
              ))}
            </div>
          </>
        ) : (
          <p className="text-zinc-400">請先選擇兩首歌曲。</p>
        )}
      </section>
      <section className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
        <h3 className="font-bold">演出歌單（{setlist.length} 首）</h3>
        <p className="text-xs text-zinc-400">
          以歌曲為單位；相鄰曲目會檢查實體碟片衝突與混音資料。
        </p>
        {!setlist.length && <p>尚未加入歌曲，請從唱片櫃選歌。</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {setlist.map((t, i) => {
            const next = setlist[i + 1];
            const analysis = next
              ? analyzeMix(t, next, pitchRangeLimit, halfDoubleMode)
              : null;
            return (
              <article
                key={t.id + "-" + i}
                className="border border-zinc-700 rounded-lg p-3 space-y-2 text-sm"
              >
                <div className="flex justify-between">
                  <span>
                    #{i + 1} {t.title}
                  </span>
                  <button
                    aria-label="從排歌單移除"
                    onClick={() => removeFromSetlist(i)}
                  >
                    移除
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  {t.artist} · {t.recordTitle}
                </p>
                <p className="text-xs">
                  {t.bpm ?? "未知"} BPM · {t.camelot || "調性未知"}
                </p>
                {next && (
                  <>
                    <p className="text-xs text-amber-300">
                      {physicalConflict(t, next) ||
                        analysis.reason ||
                        (analysis.harmonic.score === null
                          ? "需試聽或調整速度"
                          : analysis.harmonic.score + "% 近似契合")}
                    </p>
                    <button
                      onClick={() => {
                        setDeckAId(t.id);
                        setDeckBId(next.id);
                      }}
                      className="text-xs text-cyan-300"
                    >
                      測試接下一首
                    </button>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
