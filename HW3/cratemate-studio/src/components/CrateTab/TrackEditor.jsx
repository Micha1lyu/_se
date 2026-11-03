import { useState } from "react";
import { CAMELOT_KEYS } from "../../utils/records.js";
import { defaultTrack, normalizeTrack } from "../../utils/collection.js";

export default function TrackEditor({ record, onSave }) {
  const [draft, setDraft] = useState(defaultTrack);
  const [error, setError] = useState("");
  const field = (key, label, type = "text", extra = {}) => (
    <label key={key} className="text-zinc-400">
      {label}
      <input
        className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
        type={type}
        value={draft[key] ?? ""}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        {...extra}
      />
    </label>
  );
  const save = (e) => {
    e.preventDefault();
    try {
      onSave(normalizeTrack(draft, draft.id || "track-" + crypto.randomUUID()));
      setDraft(defaultTrack());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <details className="mt-3 border-t border-zinc-700 pt-3 text-xs">
      <summary className="cursor-pointer text-amber-300">
        管理歌曲：新增／編輯
      </summary>
      <p className="my-2 text-zinc-400">
        歌曲資料可留白；不明的 BPM、調性或碟片位置不會自動推測。
      </p>
      {record.tracks.map((t) => (
        <div key={t.id} className="flex justify-between gap-2 py-1">
          <span>{t.title}</span>
          <button
            type="button"
            className="text-cyan-300"
            onClick={() => {
              setDraft({ ...defaultTrack(), ...t });
              setError("");
            }}
          >
            編輯
          </button>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-rose-400">
          {error}
        </p>
      )}
      <form onSubmit={save} className="grid grid-cols-2 gap-2 mt-3">
        {field("title", "歌曲名稱", "text", { required: true })}
        {field("artist", "歌曲藝人（空白沿用專輯）")}
        {field("version", "歌曲版本／Mix")}
        {field("duration", "時長（分:秒，例如 3:43）")}
        {field("genre", "歌曲曲風")}
        {field("bpm", "BPM（未知留白）", "number", { min: 0.01, step: "any" })}
        <label className="text-zinc-400">
          Camelot 調性
          <select
            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
            value={draft.camelot}
            onChange={(e) => setDraft({ ...draft, camelot: e.target.value })}
          >
            <option value="">未知</option>
            {CAMELOT_KEYS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        {field("energy", "能量 1–10（未知留白）", "number", {
          min: 1,
          max: 10,
          step: 1,
        })}
        {field("discNumber", "實體碟片編號（未知留白）", "number", {
          min: 1,
          step: 1,
        })}
        <label className="text-zinc-400">
          該碟片面別
          <select
            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
            value={draft.side}
            onChange={(e) => setDraft({ ...draft, side: e.target.value })}
          >
            <option value="">未知</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>
        </label>
        {field("position", "面內曲序（例如 1）")}
        <button type="submit" className="bg-cyan-500 text-black rounded p-2">
          {draft.id ? "儲存歌曲修改" : "新增歌曲"}
        </button>
        {draft.id && (
          <button
            type="button"
            onClick={() => {
              setDraft(defaultTrack());
              setError("");
            }}
          >
            取消編輯
          </button>
        )}
      </form>
    </details>
  );
}
