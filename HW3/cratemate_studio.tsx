import React, { useState, useMemo } from 'react';
import {
  Disc,
  Sliders,
  Activity,
  Cpu,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Download,
  Terminal,
  Music,
  DollarSign,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Trash2,
  Volume2,
  Wrench,
  Copy,
  Check,
  Info,
  BarChart3,
  Radio
} from 'lucide-react';

// ==========================================
// 預設真實感黑膠唱片資料庫 (Pre-populated Crate)
// ==========================================
const INITIAL_RECORDS = [
  {
    id: 'rec-1',
    artist: 'Justice',
    title: 'Hyperdrama',
    trackFeatured: 'Generator / Neverender (ft. Tame Impala)',
    year: 2024,
    genre: 'Electro',
    rpm: 33.3,
    bpm: 122,
    camelot: '8A',
    musicalKey: 'A Minor',
    energy: 9,
    pressing: 'Crystal Clear Double LP (Ed Banger / Because Music)',
    conditionMedia: 'M',
    conditionSleeve: 'NM',
    buyPriceUSD: 42,
    currentValUSD: 68,
    playCount: 14,
    playsSinceClean: 4,
    coverGradient: 'from-amber-500/30 via-red-900/40 to-zinc-950',
    accentColor: '#f59e0b',
    notes: 'French Touch 經典強勢回歸，低頻極具侵略性，建議搭配高循跡力唱頭。'
  },
  {
    id: 'rec-2',
    artist: 'ISOxo & Knock2',
    title: '4EVR',
    trackFeatured: 'radial / 4EVR (VIP Edit)',
    year: 2024,
    genre: 'Trap / Bass',
    rpm: 45,
    bpm: 150,
    camelot: '5A',
    musicalKey: 'C Minor',
    energy: 10,
    pressing: '88rising Limited Heavyweight 180g Black',
    conditionMedia: 'NM',
    conditionSleeve: 'NM',
    buyPriceUSD: 48,
    currentValUSD: 135,
    playCount: 19,
    playsSinceClean: 9, // Needs cleaning soon!
    coverGradient: 'from-cyan-500/30 via-blue-900/40 to-zinc-950',
    accentColor: '#06b6d4',
    notes: '45轉高動態刻片，Sub-bass 能量極強，混音時注意主輸出 Headroom。'
  },
  {
    id: 'rec-3',
    artist: 'Tame Impala',
    title: 'Currents',
    trackFeatured: 'Let It Happen / The Less I Know The Better',
    year: 2015,
    genre: 'Indie / R&B',
    rpm: 33.3,
    bpm: 125,
    camelot: '9A',
    musicalKey: 'E Minor',
    energy: 7,
    pressing: 'Limited Violet & Amber Colored 2LP Gatefold',
    conditionMedia: 'NM',
    conditionSleeve: 'VG+',
    buyPriceUSD: 38,
    currentValUSD: 95,
    playCount: 32,
    playsSinceClean: 2,
    coverGradient: 'from-purple-600/30 via-fuchsia-900/40 to-zinc-950',
    accentColor: '#a855f7',
    notes: '迷幻合成器音場寬廣，與 Justice - Hyperdrama 可做 8A -> 9A 無縫順接。'
  },
  {
    id: 'rec-4',
    artist: 'Men I Trust',
    title: 'Oncle Jazz',
    trackFeatured: 'Show Me How / Tailwhip',
    year: 2019,
    genre: 'Indie / R&B',
    rpm: 33.3,
    bpm: 116,
    camelot: '8B',
    musicalKey: 'C Major',
    energy: 5,
    pressing: 'Japan Tour Edition OBI Strip Clear Vinyl',
    conditionMedia: 'M',
    conditionSleeve: 'M',
    buyPriceUSD: 55,
    currentValUSD: 120,
    playCount: 21,
    playsSinceClean: 3,
    coverGradient: 'from-emerald-500/30 via-teal-900/40 to-zinc-950',
    accentColor: '#10b981',
    notes: '溫暖類比 Bassline，極適合 Warm-up 開場或黃金時段降溫過渡。'
  },
  {
    id: 'rec-5',
    artist: 'Polyphia',
    title: 'Remember That You Will Die',
    trackFeatured: 'Playing God / Ego Death (ft. Steve Vai)',
    year: 2022,
    genre: 'Trap / Bass',
    rpm: 33.3,
    bpm: 138,
    camelot: '6A',
    musicalKey: 'G Minor',
    energy: 8,
    pressing: 'Memento Mori Blood Red & Gold Splatter',
    conditionMedia: 'NM',
    conditionSleeve: 'NM',
    buyPriceUSD: 35,
    currentValUSD: 74,
    playCount: 11,
    playsSinceClean: 8,
    coverGradient: 'from-rose-500/30 via-red-950/50 to-zinc-950',
    accentColor: '#f43f5e',
    notes: '前衛器樂結合 808 鼓組，節奏切分複雜，建議於 Breakdown 段落做 Echo Out 混音。'
  },
  {
    id: 'rec-6',
    artist: 'Charlotte de Witte',
    title: 'Overdrive EP',
    trackFeatured: 'Overdrive / High Street',
    year: 2023,
    genre: 'Techno',
    rpm: 45,
    bpm: 136,
    camelot: '7A',
    musicalKey: 'D Minor',
    energy: 10,
    pressing: 'KNTXT 12" Maxi-Single 180g Pressing',
    conditionMedia: 'M',
    conditionSleeve: 'NM',
    buyPriceUSD: 26,
    currentValUSD: 44,
    playCount: 16,
    playsSinceClean: 1,
    coverGradient: 'from-lime-500/30 via-emerald-950/40 to-zinc-950',
    accentColor: '#84cc16',
    notes: '45轉俱樂部專用單曲，Acid 303 線條極為銳利，Peak-Time 必備武器。'
  }
];

// ==========================================
// Camelot 12 音階調性輔助工具
// ==========================================
const parseCamelot = (code) => {
  if (!code) return { num: 8, letter: 'A' };
  const num = parseInt(code.slice(0, -1), 10) || 8;
  const letter = code.slice(-1).toUpperCase() === 'B' ? 'B' : 'A';
  return { num, letter };
};

const evaluateHarmonicMatch = (camA, camB) => {
  const a = parseCamelot(camA);
  const b = parseCamelot(camB);
  const diff = Math.abs(a.num - b.num);
  const circularDiff = Math.min(diff, 12 - diff);

  if (a.num === b.num && a.letter === b.letter) {
    return {
      score: 100,
      status: 'PERFECT_UNISON',
      label: 'Perfect Harmonic Unison (同調完美共振)',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
      advice: '兩首曲目處於完全相同的調性中心，可進行長達 32-64 小節的雙軌疊加混音 (Long Blend)，旋律與 Bassline 完全不打架。'
    };
  }
  if (a.num === b.num && a.letter !== b.letter) {
    return {
      score: 94,
      status: 'RELATIVE_SCALE',
      label: 'Relative Major / Minor (關係大小調轉換)',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40',
      advice: '音階組成音完全相同，但情緒由「深沉內斂 (A)」轉向「明亮開闊 (B)」或反之，適合創造細膩的敘事轉折。'
    };
  }
  if (circularDiff === 1 && a.letter === b.letter) {
    return {
      score: 92,
      status: 'FIFTH_STEP',
      label: 'Adjacent Fifth Step (+1/-1 五度圈順接)',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
      advice: '標準俱樂部和聲混音法！五度圈相鄰調性僅相差一個升降記號，混音滑順且能自然推進舞池能量。'
    };
  }
  if (circularDiff === 2 && a.letter === b.letter) {
    return {
      score: 78,
      status: 'ENERGY_BOOST',
      label: 'Whole-Step Energy Boost (+2/-2 全音能量跳躍)',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
      advice: '具備強烈能量拉升感 (Energy Boost Mix)，建議在無主旋律的純鼓組 (Intro/Outro Drum Loop) 段落快速切換低頻 EQ。'
    };
  }
  return {
    score: 52,
    status: 'PERCUSSIVE_CUT',
    label: 'Chromatic Clash — Percussive Cut Only (調性衝突・建議節奏切入)',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/40',
    advice: '兩首曲目和聲重疊會產生不協和音。請避免同時開啟雙軌旋律，務必使用 High-Pass Filter 濾除舊曲低頻，或於 Breakdown 瞬間做 Drop Cut。'
  };
};

// ==========================================
// 主應用程式組件
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('crate');
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedCamelot, setSelectedCamelot] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // 新增黑膠表單狀態
  const [newRec, setNewRec] = useState({
    artist: '',
    title: '',
    trackFeatured: '',
    year: 2026,
    genre: 'Electro',
    rpm: 33.3,
    bpm: 126,
    camelot: '8A',
    musicalKey: 'A Minor',
    energy: 8,
    pressing: '180g Audiophile Pressing',
    conditionMedia: 'M',
    conditionSleeve: 'NM',
    buyPriceUSD: 38,
    currentValUSD: 52
  });

  // Tab 2: 雙唱盤混音狀態 (Deck A & Deck B)
  const [deckAId, setDeckAId] = useState('rec-1'); // Justice (122 BPM, 8A)
  const [deckBId, setDeckBId] = useState('rec-3'); // Tame Impala (125 BPM, 9A)
  const [pitchRangeLimit, setPitchRangeLimit] = useState(8); // ±8% or ±16% on SL-1200
  const [halfDoubleMode, setHalfDoubleMode] = useState(false);
  const [setlist, setSetlist] = useState([
    INITIAL_RECORDS[3], // Men I Trust (116 BPM, 8B)
    INITIAL_RECORDS[0], // Justice (122 BPM, 8A)
    INITIAL_RECORDS[2], // Tame Impala (125 BPM, 9A)
    INITIAL_RECORDS[5], // Charlotte de Witte (136 BPM, 7A)
    INITIAL_RECORDS[1]  // ISOxo & Knock2 (150 BPM, 5A)
  ]);

  // Tab 3: 硬體唱頭與聲學監控狀態
  const [stylusHours, setStylusHours] = useState(418);
  const [stylusMaxHours, setStylusMaxHours] = useState(1000);
  const [trackingForce, setTrackingForce] = useState(3.0);
  const [cartridgeModel, setCartridgeModel] = useState('Ortofon Concorde MKII Club');
  const [jpTransformerInput, setJpTransformerInput] = useState(115); // Taiwan wall socket 115V
  const [stepDownEnabled, setStepDownEnabled] = useState(true);
  const [roomWidth, setRoomWidth] = useState(3.8);
  const [speakerDist, setSpeakerDist] = useState(1.85);

  // Tab 4: 複製與匯出通知狀態
  const [copiedType, setCopiedType] = useState(null);

  const USD_TO_TWD = 32.2;

  // 篩選後的唱片列表
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.trackFeatured.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.pressing.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'ALL' || r.genre === selectedGenre;
      const matchesKey = selectedCamelot === 'ALL' || r.camelot === selectedCamelot;
      return matchesSearch && matchesGenre && matchesKey;
    });
  }, [records, searchQuery, selectedGenre, selectedCamelot]);

  // 資產統計計算
  const crateStats = useMemo(() => {
    const totalCostUSD = records.reduce((acc, r) => acc + Number(r.buyPriceUSD), 0);
    const totalValUSD = records.reduce((acc, r) => acc + Number(r.currentValUSD), 0);
    const roiPercent = totalCostUSD > 0 ? (((totalValUSD - totalCostUSD) / totalCostUSD) * 100).toFixed(1) : '0.0';
    const needsCleaningCount = records.filter((r) => r.playsSinceClean >= 8).length;
    return {
      totalCostUSD,
      totalValUSD,
      totalValTWD: Math.round(totalValUSD * USD_TO_TWD),
      roiPercent,
      needsCleaningCount
    };
  }, [records]);

  // Deck A & Deck B 混音計算
  const deckA = useMemo(() => records.find((r) => r.id === deckAId) || records[0], [records, deckAId]);
  const deckB = useMemo(() => records.find((r) => r.id === deckBId) || records[1], [records, deckBId]);

  const mixAnalysis = useMemo(() => {
    if (!deckA || !deckB) return null;

    // 計算直接對拍 vs 倍速/半速對拍
    const targetBpmDirect = deckA.bpm;
    const targetBpmHalfDouble = deckB.bpm > deckA.bpm * 1.35 ? deckA.bpm * 2 : deckB.bpm < deckA.bpm * 0.7 ? deckA.bpm / 2 : deckA.bpm;
    const effectiveTargetBpm = halfDoubleMode ? targetBpmHalfDouble : targetBpmDirect;

    const pitchDiffPercent = (((effectiveTargetBpm - deckB.bpm) / deckB.bpm) * 100);
    const absPitch = Math.abs(pitchDiffPercent);
    const withinRange = absPitch <= pitchRangeLimit;

    // 計算 Pitch 改變造成的音高偏移 (每 ±5.95% 約為 1 個半音 Semitone)
    const semitoneShift = (pitchDiffPercent / 5.946).toFixed(2);
    const harmonic = evaluateHarmonicMatch(deckA.camelot, deckB.camelot);

    // Muse Spark 1.3 智慧混音教練建議生成
    let museAdvice = [];
    if (deckA.rpm !== deckB.rpm) {
      museAdvice.push(`⚠️ 轉速切換提醒：Deck A 為 ${deckA.rpm} RPM，Deck B 為 ${deckB.rpm} RPM。放下唱針前請務必確認唱盤左下角 33/45 轉速實體按鍵！`);
    }
    if (absPitch > 8 && absPitch <= 16) {
      museAdvice.push(`🎛️ 幅度提示：需調整 ${pitchDiffPercent > 0 ? '+' : ''}${pitchDiffPercent.toFixed(2)}%，請按下唱盤上的「×2 (±16%)」Pitch 範圍擴充鍵，建議開啟 Master Tempo 或在無長音段落過渡以避免人聲變調 (${semitoneShift} 半音)。`);
    } else if (absPitch <= 4) {
      museAdvice.push(`✨ 甜點區轉速：Pitch 僅需微調 ${pitchDiffPercent > 0 ? '+' : ''}${pitchDiffPercent.toFixed(2)}%，類比黑膠的音色與動態可保持最佳原汁原味。`);
    } else if (absPitch > 16) {
      museAdvice.push(`⚡ 跨速域技巧：兩曲原生速度差距達 ${Math.abs(deckA.bpm - deckB.bpm)} BPM。建議在 Deck A 第 32 小節按下「Start/Stop」做出經典 Power-Down 煞車降速效果，再直接 Drop 進入 Deck B！`);
    }

    if (deckB.energy > deckA.energy) {
      museAdvice.push(`🔥 能量推進 (Energy ${deckA.energy} → ${deckB.energy})：在 Deck A Outro 前 16 小節將 Deck B 的 LOW EQ 歸零切入，於 Phrase 第 1 拍瞬間進行「Bass Swap (低頻互換)」，引爆下一波高潮。`);
    } else {
      museAdvice.push(`🌊 氛圍收斂 (Energy ${deckA.energy} → ${deckB.energy})：適合運用 Pioneer DJM 的 Dub Echo 或 High-Pass Filter 將 Deck A 殘響拉遠，讓 Deck B 溫暖的鋪陳自然浮現。`);
    }

    return {
      pitchDiffPercent,
      withinRange,
      semitoneShift,
      harmonic,
      museAdvice
    };
  }, [deckA, deckB, pitchRangeLimit, halfDoubleMode]);

  // 操作處理函數：播放黑膠 (+1 次數 & 同步增加唱針時數)
  const handleSpinRecord = (id) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, playCount: r.playCount + 1, playsSinceClean: r.playsSinceClean + 1 }
          : r
      )
    );
    setStylusHours((h) => Number((h + 0.4).toFixed(1)));
  };

  // 操作處理函數：清潔黑膠 (重置未清潔播放計數)
  const handleCleanRecord = (id) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, playsSinceClean: 0 } : r))
    );
  };

  // 操作處理函數：新增黑膠入櫃
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newRec.artist.trim() || !newRec.title.trim()) return;
    const created = {
      ...newRec,
      id: `rec-${Date.now()}`,
      bpm: Number(newRec.bpm) || 124,
      rpm: Number(newRec.rpm) || 33.3,
      buyPriceUSD: Number(newRec.buyPriceUSD) || 35,
      currentValUSD: Number(newRec.currentValUSD) || 45,
      energy: Number(newRec.energy) || 7,
      playCount: 1,
      playsSinceClean: 0,
      coverGradient: 'from-amber-500/30 via-emerald-900/40 to-zinc-950',
      accentColor: '#10b981',
      notes: '由 OpenCode + Big Pickle 自動化序列化入庫之黑膠收藏。'
    };
    setRecords([created, ...records]);
    setShowAddModal(false);
  };

  // 加入排歌清單
  const addToSetlist = (rec) => {
    setSetlist((prev) => [...prev, rec]);
  };

  const removeFromSetlist = (idx) => {
    setSetlist((prev) => prev.filter((_, i) => i !== idx));
  };

  // 複製指令或匯出 JSON/Pickle 結構
  const handleCopyContent = (type, text) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
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
      <header className="sticky top-0 z-30 border-b border-zinc-800/90 bg-[#0d0f14]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* 品牌識別與唱盤轉速指示燈 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border-2 border-amber-500/60 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Disc className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-black" title="Quartz Lock Active" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    CrateMate <span className="text-amber-400 font-mono">STUDIO</span>
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
                ${crateStats.totalValUSD}
              </span>
            </div>
          </div>

          {/* AI 雙核心與硬體即時遙測資訊列 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">Code & State:</span>
              <span className="font-mono text-cyan-300 font-medium">OpenCode + Big Pickle</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400">Audio AI:</span>
              <span className="font-mono text-amber-300 font-medium">Muse Spark 1.3</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-950/30 border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300">Crate 估值:</span>
              <span className="font-mono font-bold text-emerald-400">
                ${crateStats.totalValUSD} USD (NT${crateStats.totalValTWD.toLocaleString()})
              </span>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                +{crateStats.roiPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* 四大核心功能切換頁籤 (Navigation Tabs) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar border-t border-zinc-800/60 bg-[#0b0d12]">
          {[
            {
              id: 'crate',
              label: '1. 黑膠唱片櫃與身價追蹤',
              sub: 'Vinyl Crate & Valuation',
              icon: Disc,
              badge: `${records.length} LPs`
            },
            {
              id: 'mixer',
              label: '2. 智慧混音排歌與轉速計算',
              sub: 'Harmonic Set & Pitch Calc',
              icon: Sliders,
              badge: 'Muse 1.3'
            },
            {
              id: 'hardware',
              label: '3. 硬體校準與唱頭壽命監控',
              sub: 'Stylus & 100V Telemetry',
              icon: Activity,
              badge: `${stylusHours}h`
            },
            {
              id: 'blueprint',
              label: '4. 專案價值與 AI 商業藍圖',
              sub: 'Value & SaaS Architecture',
              icon: Cpu,
              badge: 'ROI 模型'
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2.5 px-4 py-3 text-left border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/10 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <div>
                  <div className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-zinc-800 text-zinc-400'
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

      {/* 主要內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ============================================================
            TAB 1: 黑膠唱片櫃與身價追蹤 (Vinyl Crate & Valuation)
           ============================================================ */}
        {activeTab === 'crate' && (
          <div className="space-y-6">
            {/* 頂部四大數據儀表卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>收藏總市值 (Discogs Est.)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    NT$ {crateStats.totalValTWD.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    (${crateStats.totalValUSD} USD)
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>購入成本: ${crateStats.totalCostUSD} USD</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    增值 +{crateStats.roiPercent}%
                  </span>
                </div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>館藏壓片與轉速規格</span>
                  <Disc className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-bold font-mono text-white">
                    {records.length} <span className="text-sm font-normal text-zinc-400">張黑膠</span>
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    33⅓ & 45 RPM
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-zinc-400">
                  涵蓋 Electro / Trap / Indie / Techno 限量版
                </div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>超音波洗片與靜電刷提醒</span>
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      crateStats.needsCleaningCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {crateStats.needsCleaningCount}{' '}
                    <span className="text-sm font-normal text-zinc-400">張待清潔</span>
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-zinc-400">
                  每播放滿 8 次自動觸發溝槽深層清潔警示
                </div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Muse Spark 1.3 聲學索引</span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-cyan-300">100%</span>
                  <span className="text-xs text-zinc-400">Camelot 調性已標記</span>
                </div>
                <div className="mt-2 text-[11px] text-zinc-400">
                  支援一鍵送入雙唱盤計算 Pitch % 與混音路徑
                </div>
              </div>
            </div>

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
                  {['ALL', 'Electro', 'Trap / Bass', 'Indie / R&B', 'Techno'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        selectedGenre === g
                          ? 'bg-amber-500 text-black font-semibold shadow-sm shadow-amber-500/30'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {g === 'ALL' ? '全部曲風' : g}
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
                  {['5A', '6A', '7A', '8A', '8B', '9A', '10A'].map((k) => (
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
              <div className="bg-zinc-900/95 border border-amber-500/40 rounded-xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Disc className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      新增黑膠唱片至 CrateMate 資料庫 (支援自動計算增值與調性)
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800"
                  >
                    關閉
                  </button>
                </div>

                <form onSubmit={handleAddRecord} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">藝人名稱 (Artist)*</label>
                    <input
                      type="text"
                      required
                      placeholder="例如: Fred again.."
                      value={newRec.artist}
                      onChange={(e) => setNewRec({ ...newRec, artist: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">專輯/EP 名稱 (Title)*</label>
                    <input
                      type="text"
                      required
                      placeholder="例如: USB (Vinyl Album)"
                      value={newRec.title}
                      onChange={(e) => setNewRec({ ...newRec, title: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">主打曲目 (Featured Track)</label>
                    <input
                      type="text"
                      placeholder="例如: Baby again.. / Rumble"
                      value={newRec.trackFeatured}
                      onChange={(e) => setNewRec({ ...newRec, trackFeatured: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">曲風分類 (Genre)</label>
                    <select
                      value={newRec.genre}
                      onChange={(e) => setNewRec({ ...newRec, genre: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                    >
                      <option value="Electro">Electro</option>
                      <option value="Trap / Bass">Trap / Bass</option>
                      <option value="Indie / R&B">Indie / R&B</option>
                      <option value="Techno">Techno</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">轉速 (RPM) & 原生 BPM</label>
                    <div className="flex gap-2">
                      <select
                        value={newRec.rpm}
                        onChange={(e) => setNewRec({ ...newRec, rpm: parseFloat(e.target.value) })}
                        className="w-1/2 bg-zinc-950 border border-zinc-800 rounded px-2 py-2 font-mono text-white"
                      >
                        <option value={33.3}>33 1/3 RPM</option>
                        <option value={45}>45 RPM</option>
                      </select>
                      <input
                        type="number"
                        value={newRec.bpm}
                        onChange={(e) => setNewRec({ ...newRec, bpm: e.target.value })}
                        placeholder="BPM"
                        className="w-1/2 bg-zinc-950 border border-zinc-800 rounded px-2 py-2 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Camelot 調性 & 音階</label>
                    <div className="flex gap-2">
                      <select
                        value={newRec.camelot}
                        onChange={(e) => setNewRec({ ...newRec, camelot: e.target.value })}
                        className="w-1/2 bg-zinc-950 border border-zinc-800 rounded px-2 py-2 font-mono text-amber-300"
                      >
                        {['1A','2A','3A','4A','5A','6A','7A','8A','9A','10A','11A','12A','8B','9B'].map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newRec.musicalKey}
                        onChange={(e) => setNewRec({ ...newRec, musicalKey: e.target.value })}
                        placeholder="A Minor"
                        className="w-1/2 bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">購入價 vs 現值 (USD)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newRec.buyPriceUSD}
                        onChange={(e) => setNewRec({ ...newRec, buyPriceUSD: e.target.value })}
                        placeholder="Buy $"
                        className="w-1/2 bg-zinc-950 border border-zinc-800 rounded px-2 py-2 font-mono text-white"
                      />
                      <input
                        type="number"
                        value={newRec.currentValUSD}
                        onChange={(e) => setNewRec({ ...newRec, currentValUSD: e.target.value })}
                        placeholder="Val $"
                        className="w-1/2 bg-zinc-950 border border-zinc-800 rounded px-2 py-2 font-mono text-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all"
                    >
                      確認寫入黑膠櫃
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 黑膠唱片卡片網格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRecords.map((rec) => {
                const profitUSD = rec.currentValUSD - rec.buyPriceUSD;
                const profitPercent = ((profitUSD / rec.buyPriceUSD) * 100).toFixed(0);
                const needsCleaning = rec.playsSinceClean >= 8;

                return (
                  <div
                    key={rec.id}
                    className={`group relative rounded-2xl border bg-gradient-to-b ${rec.coverGradient} border-zinc-800/90 hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg`}
                  >
                    {/* 頂部壓片版本與轉速標籤 */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-zinc-200 border border-white/10 backdrop-blur-sm">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: rec.accentColor }}
                          />
                          {rec.genre}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-900/90 text-amber-300 border border-amber-500/30">
                            {rec.rpm === 45 ? '45 RPM' : '33⅓ RPM'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-900/90 text-cyan-300 border border-cyan-500/30">
                            {rec.camelot}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-900/90 text-white border border-zinc-700">
                            {rec.bpm} BPM
                          </span>
                        </div>
                      </div>

                      {/* 模擬黑膠溝槽視覺與專輯標題 */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full bg-zinc-950 border-4 border-zinc-800/90 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-45 transition-transform duration-500">
                          <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-black"
                              style={{ backgroundColor: rec.accentColor }}
                            >
                              {rec.camelot}
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-mono text-zinc-400 truncate">
                            {rec.artist} • {rec.year}
                          </div>
                          <h3 className="text-lg font-bold text-white truncate">
                            {rec.title}
                          </h3>
                          <p className="text-xs text-amber-300/90 truncate font-medium">
                            ♪ {rec.trackFeatured}
                          </p>
                        </div>
                      </div>

                      {/* 壓片資訊與碟片品相 */}
                      <div className="bg-black/45 border border-white/5 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-zinc-300">
                          <span className="text-zinc-500">壓片版本:</span>
                          <span className="font-medium text-right truncate max-w-[200px]" title={rec.pressing}>
                            {rec.pressing}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">品相 (Media / Sleeve):</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px]">
                              碟 {rec.conditionMedia}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                              封 {rec.conditionSleeve}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                          <span className="text-zinc-500">Discogs 行情估值:</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-zinc-400 line-through text-[11px]">
                              ${rec.buyPriceUSD}
                            </span>
                            <span className="text-emerald-400 font-bold text-sm">
                              ${rec.currentValUSD} USD
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              +{profitPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 聲音筆記 */}
                      <p className="text-xs text-zinc-300/90 leading-relaxed line-clamp-2">
                        {rec.notes}
                      </p>
                    </div>

                    {/* 底部清潔監控與雙唱盤快速載入區 */}
                    <div className="bg-zinc-950/90 border-t border-zinc-800/80 px-5 py-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">
                            累計播放: <strong className="text-white font-mono">{rec.playCount}</strong> 次
                          </span>
                          <span className="text-zinc-600">|</span>
                          <span
                            className={`font-mono flex items-center gap-1 ${
                              needsCleaning ? 'text-amber-400 font-semibold' : 'text-zinc-400'
                            }`}
                          >
                            {needsCleaning ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                待深層洗片 ({rec.playsSinceClean}/8)
                              </>
                            ) : (
                              <>距上次清潔 {rec.playsSinceClean}/8 次</>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSpinRecord(rec.id)}
                            title="記錄播放一次 (+0.4h 唱針時數)"
                            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                            <span>播放 +1</span>
                          </button>
                          {rec.playsSinceClean > 0 && (
                            <button
                              onClick={() => handleCleanRecord(rec.id)}
                              title="標記已完成超音波洗片或除靜電刷清潔"
                              className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
                                needsCleaning
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
                              }`}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>已清潔</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 送入雙唱盤與排歌按鈕 */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setDeckAId(rec.id);
                            setActiveTab('mixer');
                          }}
                          className="py-1.5 px-2 rounded bg-zinc-900 hover:bg-amber-500/20 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 text-[11px] font-mono text-zinc-300 transition-all"
                        >
                          載入 Deck A
                        </button>
                        <button
                          onClick={() => {
                            setDeckBId(rec.id);
                            setActiveTab('mixer');
                          }}
                          className="py-1.5 px-2 rounded bg-zinc-900 hover:bg-cyan-500/20 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-500/40 text-[11px] font-mono text-zinc-300 transition-all"
                        >
                          載入 Deck B
                        </button>
                        <button
                          onClick={() => addToSetlist(rec)}
                          className="py-1.5 px-2 rounded bg-zinc-900 hover:bg-emerald-500/20 hover:text-emerald-300 border border-zinc-800 hover:border-emerald-500/40 text-[11px] font-mono text-zinc-300 transition-all"
                        >
                          + 排入歌單
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: 智慧混音排歌與轉速計算機 (Harmonic Set Builder & Pitch Calc)
           ============================================================ */}
        {activeTab === 'mixer' && mixAnalysis && (
          <div className="space-y-6">
            {/* 雙唱盤與中央混音器區塊 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* 左側：DECK A (主放唱盤 Master Deck) */}
              <div className="lg:col-span-4 bg-zinc-900/90 border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold">
                      DECK A • MASTER (目前播放)
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      QUARTZ 0.0%
                    </span>
                  </div>

                  {/* 選擇黑膠下拉選單 */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      選擇 Deck A 唱片:
                    </label>
                    <select
                      value={deckAId}
                      onChange={(e) => setDeckAId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                    >
                      {records.map((r) => (
                        <option key={r.id} value={r.id}>
                          [{r.camelot} • {r.bpm} BPM] {r.artist} — {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 唱盤視覺與規格 */}
                  <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 border-4 border-amber-500/50 flex items-center justify-center shrink-0">
                      <div className="text-center">
                        <div className="text-xs font-mono font-bold text-amber-400">
                          {deckA.camelot}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {deckA.rpm}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="text-xs text-zinc-400 truncate">{deckA.artist}</div>
                      <div className="text-base font-bold text-white truncate">{deckA.title}</div>
                      <div className="text-xs text-amber-300 truncate">{deckA.trackFeatured}</div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-white border border-zinc-700">
                          {deckA.bpm} BPM
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                          {deckA.musicalKey}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 唱盤底部實體轉速燈號 */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        deckA.rpm === 33.3
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                          : 'bg-zinc-950 text-zinc-600'
                      }`}
                    >
                      33
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        deckA.rpm === 45
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                          : 'bg-zinc-950 text-zinc-600'
                      }`}
                    >
                      45
                    </span>
                  </div>
                  <span className="text-zinc-400">Energy Lv.{deckA.energy}/10</span>
                </div>
              </div>

              {/* 中央：PIONEER DJM 風格對拍與調性過渡分析核心 */}
              <div className="lg:col-span-4 bg-gradient-to-b from-zinc-900 via-[#10131a] to-zinc-900 border border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold">
                      SL-1200 PITCH & HARMONIC BRIDGE
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[8, 16].map((rng) => (
                      <button
                        key={rng}
                        onClick={() => setPitchRangeLimit(rng)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          pitchRangeLimit === rng
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        ±{rng}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 核心 Pitch % 數值大字顯示 */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center space-y-2">
                  <div className="text-xs text-zinc-400">
                    Deck B 對拍所需 Pitch Fader 推桿幅度
                  </div>
                  <div
                    className={`text-3xl sm:text-4xl font-mono font-extrabold tracking-tight ${
                      mixAnalysis.withinRange ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {mixAnalysis.pitchDiffPercent > 0 ? '+' : ''}
                    {mixAnalysis.pitchDiffPercent.toFixed(2)}%
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-zinc-400">
                    <span>音高偏移: {mixAnalysis.semitoneShift} 半音</span>
                    <span>•</span>
                    <span className={mixAnalysis.withinRange ? 'text-emerald-400' : 'text-rose-400'}>
                      {mixAnalysis.withinRange
                        ? `於 ±${pitchRangeLimit}% 行程內可完美鎖拍`
                        : `超出 ±${pitchRangeLimit}% 範圍！請切換範圍或倍速`}
                    </span>
                  </div>

                  {/* 視覺化 Pitch 推桿位置 */}
                  <div className="pt-2">
                    <div className="relative h-3 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-400/70 z-10" />
                      <div
                        className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all duration-300 ${
                          mixAnalysis.withinRange ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{
                          left: `calc(50% + ${Math.max(
                            -45,
                            Math.min(45, (mixAnalysis.pitchDiffPercent / pitchRangeLimit) * 45)
                          )}% - 8px)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                      <span>-{pitchRangeLimit}% (減速)</span>
                      <span className="text-emerald-400">0% QUARTZ</span>
                      <span>+{pitchRangeLimit}% (加速)</span>
                    </div>
                  </div>
                </div>

                {/* Half-time / Double-time 切換與 Camelot 評分 */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-zinc-950/70 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs">
                    <span className="text-zinc-300">Half / Double-Time 跨速對拍模式</span>
                    <button
                      onClick={() => setHalfDoubleMode(!halfDoubleMode)}
                      className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all ${
                        halfDoubleMode
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {halfDoubleMode ? 'ON (倍速折算)' : 'OFF (1:1 直對)'}
                    </button>
                  </div>

                  <div className={`rounded-xl border p-3 ${mixAnalysis.harmonic.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{mixAnalysis.harmonic.label}</span>
                      <span className="font-mono text-sm font-extrabold">
                        {mixAnalysis.harmonic.score}%
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 mt-1 leading-relaxed">
                      {mixAnalysis.harmonic.advice}
                    </p>
                  </div>
                </div>
              </div>

              {/* 右側：DECK B (預備混入唱盤 Cue / Incoming Deck) */}
              <div className="lg:col-span-4 bg-zinc-900/90 border border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold">
                      DECK B • CUE INCOMING (下一首)
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      TARGET: {deckA.bpm} BPM
                    </span>
                  </div>

                  {/* 選擇黑膠下拉選單 */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      選擇 Deck B 欲混入唱片:
                    </label>
                    <select
                      value={deckBId}
                      onChange={(e) => setDeckBId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-cyan-400"
                    >
                      {records.map((r) => (
                        <option key={r.id} value={r.id}>
                          [{r.camelot} • {r.bpm} BPM] {r.artist} — {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 唱盤視覺與規格 */}
                  <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 border-4 border-cyan-500/50 flex items-center justify-center shrink-0">
                      <div className="text-center">
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {deckB.camelot}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {deckB.rpm}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="text-xs text-zinc-400 truncate">{deckB.artist}</div>
                      <div className="text-base font-bold text-white truncate">{deckB.title}</div>
                      <div className="text-xs text-cyan-300 truncate">{deckB.trackFeatured}</div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-white border border-zinc-700">
                          原生 {deckB.bpm} BPM
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                          {deckB.musicalKey}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 唱盤底部實體轉速燈號 */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        deckB.rpm === 33.3
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                          : 'bg-zinc-950 text-zinc-600'
                      }`}
                    >
                      33
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        deckB.rpm === 45
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                          : 'bg-zinc-950 text-zinc-600'
                      }`}
                    >
                      45
                    </span>
                  </div>
                  <span className="text-zinc-400">Energy Lv.{deckB.energy}/10</span>
                </div>
              </div>
            </div>

            {/* Muse Spark 1.3 智慧混音教練建議面板 */}
            <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-cyan-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Muse Spark 1.3 聲學混音過渡指導 (AI Transition Coach)
                  </h3>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded border border-amber-500/30">
                  {deckA.artist} ({deckA.camelot}) ➔ {deckB.artist} ({deckB.camelot})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {mixAnalysis.museAdvice.map((tip, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/85 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 leading-relaxed"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* 45 分鐘黑膠演出排歌時間軸與能量波形圖 (Setlist Timeline & Energy Wave) */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span>45 分鐘黑膠演出排歌時間軸與舞池能量曲線 (Setlist Energy Wave)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    點擊任兩首相鄰曲目可立即載入上方 Deck A / Deck B 計算轉速與 EQ 交接點
                  </p>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  總曲目: <strong className="text-white">{setlist.length}</strong> 首 • 預估演出時長:{' '}
                  <strong className="text-emerald-400">{setlist.length * 4.5} 分鐘</strong>
                </div>
              </div>

              {/* 能量柱狀與調性流向視覺化 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {setlist.map((item, idx) => {
                  const nextItem = setlist[idx + 1];
                  const nextMatch = nextItem
                    ? evaluateHarmonicMatch(item.camelot, nextItem.camelot)
                    : null;

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3.5 flex flex-col justify-between relative group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-amber-400 font-bold">
                            #{idx + 1}
                          </span>
                          <span>{item.rpm === 45 ? '45 RPM' : '33⅓ RPM'}</span>
                          <button
                            onClick={() => removeFromSetlist(idx)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors"
                            title="從排歌單移除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="font-bold text-sm text-white truncate">{item.title}</div>
                        <div className="text-xs text-zinc-400 truncate">{item.artist}</div>

                        <div className="flex items-center gap-1.5 mt-2 font-mono text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {item.camelot}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-200">
                            {item.bpm} BPM
                          </span>
                        </div>
                      </div>

                      {/* 能量條 */}
                      <div className="mt-3 pt-2 border-t border-zinc-900 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                          <span>Energy</span>
                          <span className="text-amber-400">{item.energy}/10</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                            style={{ width: `${item.energy * 10}%` }}
                          />
                        </div>

                        {nextItem && (
                          <button
                            onClick={() => {
                              setDeckAId(item.id);
                              setDeckBId(nextItem.id);
                            }}
                            className="w-full mt-2 py-1 px-2 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-zinc-300 flex items-center justify-between border border-zinc-800"
                          >
                            <span>測試接下一首</span>
                            <span className="text-emerald-400">{nextMatch.score}% 契合</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: 硬體校準與唱頭壽命監控 (Turntable & Stylus Telemetry)
           ============================================================ */}
        {activeTab === 'hardware' && (
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
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      鑽石橢圓針尖良好
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">目前服役唱頭型號:</label>
                    <select
                      value={cartridgeModel}
                      onChange={(e) => {
                        setCartridgeModel(e.target.value);
                        if (e.target.value.includes('Club')) setTrackingForce(3.0);
                        else if (e.target.value.includes('Nagaoka')) setTrackingForce(1.8);
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
                          stylusHours > 800 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, (stylusHours / stylusMaxHours) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                      唱針超過 800 小時後高頻解析度會開始衰退並加速黑膠溝槽磨損。在「唱片櫃」點擊播放會自動累加時數。
                    </p>
                  </div>

                  {/* 針壓與抗滑同步計算 */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300">設定針壓 (Tracking Force):</span>
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
                        stepDownEnabled
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      }`}
                    >
                      {stepDownEnabled ? '100.2V 降壓保護中' : '過壓風險 115V!'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    台灣眾多黑膠玩家使用日規 Technics SL-1200MK3D/MK5 (AC 100V)。若直接插台灣壁插 (110V~116V)，會導致變壓器長期發熱、馬達扭力異常甚至燒毀穩壓 IC。
                  </p>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">台灣室內壁插實測電壓:</span>
                      <span className="font-mono font-bold text-white">{jpTransformerInput} V AC</span>
                    </div>
                    <input
                      type="range"
                      min="108"
                      max="120"
                      step="1"
                      value={jpTransformerInput}
                      onChange={(e) => setJpTransformerInput(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                      <span className="text-xs text-zinc-300">串接 115V ➔ 100V 隔離降壓器:</span>
                      <button
                        onClick={() => setStepDownEnabled(!stepDownEnabled)}
                        className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                          stepDownEnabled
                            ? 'bg-emerald-500 text-black'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {stepDownEnabled ? '已開啟降壓 (ON)' : '未接降壓器 (BYPASS)'}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-3.5 border text-xs leading-relaxed ${
                      stepDownEnabled
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    {stepDownEnabled ? (
                      <>
                        ✅ <strong>供電狀態極佳：</strong>送入唱盤電壓穩定於{' '}
                        <span className="font-mono font-bold">
                          {(jpTransformerInput * 0.87).toFixed(1)}V
                        </span>
                        ，石英鎖相迴路 (Quartz PLL) 溫升降低 38%，背景底噪更純淨。
                      </>
                    ) : (
                      <>
                        ⚠️ <strong>警告：</strong>目前唱盤直接承受{' '}
                        <span className="font-mono font-bold">{jpTransformerInput}V</span> 高壓，超標達{' '}
                        {jpTransformerInput - 100}V！請立即串接 100V 降壓器以保護古董唱盤主機板。
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <span>Phono 接地線狀態: GND LOCKED</span>
                  <span className="text-emerald-400">60Hz 交流哼聲已消除</span>
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
                    <span className="text-xs font-mono text-cyan-300">正三角形甜區</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    黑膠唱頭極易受到喇叭低頻震動影響而產生「Acoustic Feedback (低頻轟鳴回授)」。透過房間寬度自動計算最佳擺位與駐波頻率。
                  </p>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">聆聽空間寬度 (公尺):</span>
                        <span className="font-mono font-bold text-white">{roomWidth} m</span>
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
                          setSpeakerDist(Number((w * 0.48).toFixed(2)));
                        }}
                        className="w-full accent-emerald-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-xs">
                      <div className="bg-zinc-900/80 p-2.5 rounded-lg">
                        <div className="text-zinc-400 text-[11px]">建議左右喇叭間距</div>
                        <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                          {speakerDist} m
                        </div>
                      </div>
                      <div className="bg-zinc-900/80 p-2.5 rounded-lg">
                        <div className="text-zinc-400 text-[11px]">皇帝位聆聽垂直距離</div>
                        <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                          {(speakerDist * 0.866).toFixed(2)} m
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/80 p-2.5 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-zinc-400">第一軸向低頻駐波頻率:</span>
                      <span className="font-mono font-bold text-rose-400">
                        {(343 / (2 * roomWidth)).toFixed(1)} Hz (建議開啟 Subsonic 濾波)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 bg-zinc-950/90 border border-zinc-800 rounded-lg p-3">
                  💡 <strong>硬體防震建議：</strong>請勿將監聽喇叭與黑膠唱盤放置於同一張桌面上，或於唱盤下方加裝 Sorbothane 阻尼避震墊。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: 專案價值與 AI 商業藍圖 (Business & AI Architecture Blueprint)
           ============================================================ */}
        {activeTab === 'blueprint' && (
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
                      <strong className="text-white">告別盲目翻找唱片 (解決選歌與對拍斷層)：</strong>
                      傳統 Discogs 只能查價格，卻沒有標記 BPM、Camelot 調性與 33/45 轉速。本系統讓玩家在家練盤或派對演出前，一秒算出兩張黑膠需要推多少 <code className="text-amber-300 font-mono">% Pitch</code> 才能無縫混音。
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">保護高價絕版黑膠與唱針資產：</strong>
                      限量彩膠（如 ISOxo & Knock2、日版 OBI 側標）動輒破台幣三四千元。系統內建「播放滿 8 次洗片提醒」與「唱針 1,000 小時壽命追蹤」，防止磨損珍貴溝槽。
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">台灣/亞洲在地化硬體安全痛點：</strong>
                      針對日規 100V 唱盤在台灣 115V 電壓環境下的降壓監控，以及小坪數房間聲學駐波計算，真正具備日常高頻率打開使用的價值。
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
                      針對全球 DJ 與黑膠藏家提供無限雲端備份、Discogs 自動漲跌推播與 Muse Spark 1.3 自動排歌功能。
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="text-xs font-mono text-cyan-400 font-bold">
                      模式 B：B2B 接案客製
                    </div>
                    <div className="text-sm font-bold text-white">NT$ 80k - 150k / 案</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      為台灣獨立黑膠唱片行、Listening Bar (聽膠酒吧)、二手音響店導入「智慧試聽與庫存詢價 iPad 導購系統」。
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      模式 C：分潤與硬體導購
                    </div>
                    <div className="text-sm font-bold text-white">Affiliate 8%~15%</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      當唱針壽命達 800 小時或待洗片數超標時，精準推播替換唱針 (Ortofon/Nagaoka) 與洗片機購買連結。
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
                    <span>AI 雙引擎架構：OpenCode + Big Pickle × Muse Spark 1.3 技術整合</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    將開源代理開發流程與專業音樂聲學推理模型結合，大幅降低 80% 開發與維護成本
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopyContent('json', JSON.stringify({ records, stylusHours }, null, 2))
                    }
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedType === 'json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">已複製 JSON 快照</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>匯出 Big Pickle / JSON 狀態</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyContent('cli', openCodeScript)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedType === 'cli' ? (
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
                      <span>1. OpenCode + Big Pickle (後端資料爬蟲與零延遲序列化)</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-xs">
                      透過 <code className="text-cyan-300">OpenCode</code> 代理自動生成與維護 Discogs API 價格爬蟲及壓片矩陣碼 (Matrix Runout) 比對邏輯；並藉由 <code className="text-cyan-300">Big Pickle</code> 高效序列化收藏家的本地物件樹與歷史行情快照，確保在無網路的地下俱樂部或派對現場也能零延遲載入完整歌庫。
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-amber-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                      <Sparkles className="w-4 h-4" />
                      <span>2. Muse Spark 1.3 (音訊特徵提取與混音排歌推理引擎)</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-xs">
                      由 <code className="text-amber-300">Muse Spark 1.3</code> 負責解析每張黑膠曲目的調性中心 (Camelot Wheel)、節拍瞬態能量 (Transient Energy) 與曲式段落 (Phrase Structure)，針對不同轉速與 BPM 落差自動生成專業 DJ 等級的 EQ 與 Filter 過渡指導。
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
        )}
      </main>
    </div>
  );
}