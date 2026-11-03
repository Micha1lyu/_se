import { CONDITION_GRADES } from "../../utils/records.js";

export default function AddRecordForm({
  newRec,
  setNewRec,
  handleAddRecord,
  setShowAddModal,
  formError,
}) {
  const field = (key, label, type = "text", extra = {}) => (
    <label className="block text-zinc-400" key={key}>
      {label}
      <input
        className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
        type={type}
        value={newRec[key]}
        onChange={(e) => setNewRec({ ...newRec, [key]: e.target.value })}
        {...extra}
      />
    </label>
  );
  return (
    <section className="bg-zinc-900 border border-amber-500/40 rounded-xl p-5 space-y-4">
      <div className="flex justify-between">
        <h3 className="font-bold">新增唱片收藏</h3>
        <button type="button" onClick={() => setShowAddModal(false)}>
          關閉
        </button>
      </div>
      <p className="text-xs text-zinc-400">
        先記錄專輯與實體版本，儲存後在唱片卡片內新增各首歌曲。歌曲的
        BPM、調性與碟片位置分開填寫。
      </p>
      {formError && (
        <p role="alert" className="text-rose-400">
          {formError}
        </p>
      )}
      <form
        onSubmit={handleAddRecord}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"
      >
        {field("artist", "藝人名稱", "text", { required: true })}
        {field("title", "專輯名稱", "text", { required: true })}
        {field("year", "發行年份", "number", {
          min: 1900,
          max: 2100,
          step: 1,
        })}
        <label className="text-zinc-400">
          唱片轉速
          <select
            value={newRec.rpm}
            onChange={(e) =>
              setNewRec({ ...newRec, rpm: Number(e.target.value) })
            }
            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
          >
            <option value={33.3}>33⅓ RPM</option>
            <option value={45}>45 RPM</option>
          </select>
        </label>
        {field("pressing", "壓片版本")}
        {field("purchaseDate", "購買日期", "date")}
        {field("purchaseLocation", "購買地點")}
        {["conditionMedia", "conditionSleeve"].map((key, i) => (
          <label key={key} className="text-zinc-400">
            {i === 0 ? "唱片品相 (Media)" : "封套品相 (Sleeve)"}
            <select
              value={newRec[key]}
              onChange={(e) => setNewRec({ ...newRec, [key]: e.target.value })}
              className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
            >
              <option value="">未知</option>
              {CONDITION_GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        ))}
        {field("buyPriceTWD", "購入價 (NT$，未知可留白)", "number", {
          min: 0,
          step: 0.01,
        })}
        {field("currentValTWD", "現值 (NT$，未知可留白)", "number", {
          min: 0,
          step: 0.01,
        })}
        <button
          type="submit"
          className="rounded bg-amber-500 text-black font-bold p-2 self-end"
        >
          確認寫入黑膠櫃
        </button>
      </form>
    </section>
  );
}
