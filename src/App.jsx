import { useState, useEffect, useRef, useCallback } from "react";

const ALGORITHMS = ["FCFS", "SSTF", "SCAN", "C-SCAN", "LOOK", "C-LOOK"];
const DISK_SIZE = 200;

const ALGO_COLORS = {
  FCFS:    { primary: "#6366f1", light: "#6366f120", border: "#6366f160" },
  SSTF:    { primary: "#f59e0b", light: "#f59e0b20", border: "#f59e0b60" },
  SCAN:    { primary: "#10b981", light: "#10b98120", border: "#10b98160" },
  "C-SCAN":{ primary: "#3b82f6", light: "#3b82f620", border: "#3b82f660" },
  LOOK:    { primary: "#ec4899", light: "#ec489920", border: "#ec489960" },
  "C-LOOK":{ primary: "#14b8a6", light: "#14b8a620", border: "#14b8a660" },
};

// ── Algorithms ─────────────────────────────────────────────────────────────

function fcfs(requests, head) {
  const order = [...requests];
  let seek = 0, pos = head;
  const path = [head];
  for (const r of order) { seek += Math.abs(r - pos); pos = r; path.push(r); }
  return { order, seek, path };
}

function sstf(requests, head) {
  const remaining = [...requests];
  const order = [];
  let seek = 0, pos = head;
  const path = [head];
  while (remaining.length) {
    const idx = remaining.reduce((bi, r, i) =>
      Math.abs(r - pos) < Math.abs(remaining[bi] - pos) ? i : bi, 0);
    const next = remaining.splice(idx, 1)[0];
    seek += Math.abs(next - pos); pos = next;
    order.push(next); path.push(next);
  }
  return { order, seek, path };
}

function scan(requests, head) {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head).reverse();
  const order = [...right, ...left];
  const path = [head, ...right, DISK_SIZE - 1, ...left];
  let seek = 0, pos = head;
  for (let i = 1; i < path.length; i++) { seek += Math.abs(path[i] - pos); pos = path[i]; }
  return { order, seek, path };
}

function cscan(requests, head) {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head);
  const order = [...right, ...left];
  const path = [head, ...right, DISK_SIZE - 1, 0, ...left];
  let seek = 0, pos = head;
  for (let i = 1; i < path.length; i++) { seek += Math.abs(path[i] - pos); pos = path[i]; }
  return { order, seek, path };
}

function look(requests, head) {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head).reverse();
  const order = [...right, ...left];
  const path = [head, ...right, ...left];
  let seek = 0, pos = head;
  for (let i = 1; i < path.length; i++) { seek += Math.abs(path[i] - pos); pos = path[i]; }
  return { order, seek, path };
}

function clook(requests, head) {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head);
  const order = [...right, ...left];
  const path = [head, ...right, ...left];
  let seek = 0, pos = head;
  for (const r of order) { seek += Math.abs(r - pos); pos = r; }
  return { order, seek, path };
}

const runAlgo = (algo, requests, head) => {
  if (!requests.length) return { order: [], seek: 0, path: [head] };
  switch (algo) {
    case "FCFS":   return fcfs(requests, head);
    case "SSTF":   return sstf(requests, head);
    case "SCAN":   return scan(requests, head);
    case "C-SCAN": return cscan(requests, head);
    case "LOOK":   return look(requests, head);
    case "C-LOOK": return clook(requests, head);
    default:       return fcfs(requests, head);
  }
};

// ── Seek Chart ─────────────────────────────────────────────────────────────

function SeekChart({ path, diskSize, animStep, color }) {
  if (!path || path.length < 2) return null;
  const W = 600, H = 260, PAD = { t: 20, r: 20, b: 36, l: 48 };
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;
  const steps = path.length - 1;
  const xScale = i => PAD.l + (i / Math.max(steps, 1)) * iW;
  const yScale = v => PAD.t + iH - (v / diskSize) * iH;
  const visible = path.slice(0, animStep + 1);
  const pts = visible.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
  const gridLines = [0, 50, 100, 150, 200];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Grid */}
      {gridLines.map(g => (
        <g key={g}>
          <line x1={PAD.l} y1={yScale(g)} x2={PAD.l + iW} y2={yScale(g)}
            stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
          <text x={PAD.l - 8} y={yScale(g) + 4} textAnchor="end"
            fill="#94a3b8" fontSize="10" fontFamily="'DM Mono', monospace">{g}</text>
        </g>
      ))}
      {/* Step labels */}
      {visible.map((_, i) => (
        <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle"
          fill="#cbd5e1" fontSize="9" fontFamily="'DM Mono', monospace">{i}</text>
      ))}
      {/* Area fill */}
      {visible.length > 1 && (
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" filter="url(#glow)" />
      )}
      {/* Dots */}
      {visible.map((v, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(v)} r={i === visible.length - 1 ? 6 : 3.5}
            fill={i === 0 ? "#f59e0b" : color}
            stroke="#fff" strokeWidth="1.5" filter="url(#glow)" />
          <text x={xScale(i)} y={yScale(v) - 10} textAnchor="middle"
            fill={color} fontSize="9" fontFamily="'DM Mono', monospace"
            fontWeight="600">{v}</text>
        </g>
      ))}
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + iH} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={PAD.l} y1={PAD.t + iH} x2={PAD.l + iW} y2={PAD.t + iH} stroke="#cbd5e1" strokeWidth="1" />
      <text x={W / 2} y={H - 0} textAnchor="middle" fill="#94a3b8" fontSize="10"
        fontFamily="'DM Mono', monospace">Step →</text>
      <text x={12} y={H / 2} textAnchor="middle" fill="#94a3b8" fontSize="10"
        transform={`rotate(-90,12,${H / 2})`} fontFamily="'DM Mono', monospace">Cylinder</text>
    </svg>
  );
}

// ── Disk Track ──────────────────────────────────────────────────────────────

function DiskTrack({ path, animStep, diskSize, color }) {
  const current = path[Math.min(animStep, path.length - 1)];
  const pct = (current / diskSize) * 100;

  // Build label list: head's upcoming stops from current step
  const upcomingLabels = path.slice(0, animStep + 1);

  return (
    <div style={{ margin: "12px 0 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#94a3b8", fontFamily: "'DM Mono',monospace", fontSize: 11 }}>0</span>
        <div style={{
          background: color + "15", border: `1px solid ${color}40`,
          borderRadius: 20, padding: "3px 14px",
          color: color, fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 600
        }}>
          HEAD @ {current}
        </div>
        <span style={{ color: "#94a3b8", fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{diskSize - 1}</span>
      </div>

      {/* ── Track + needle ── */}
      <div style={{
        position: "relative", height: 48,
        background: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: 8, overflow: "visible"   // overflow visible so labels show below
      }}>
        {/* Subtle mid-lines */}
        {[25, 50, 75].map(p => (
          <div key={p} style={{
            position: "absolute", left: `${p}%`, top: 0, bottom: 0,
            width: 1, background: "#e2e8f0"
          }} />
        ))}

        {/* Request markers */}
        {path.slice(1).map((r, i) => (
          <div key={i} style={{
            position: "absolute", left: `${(r / diskSize) * 100}%`,
            top: 6, bottom: 6, width: 2, borderRadius: 2,
            background: i < animStep ? color + "cc" : color + "33",
            transition: "background 0.4s"
          }} />
        ))}

        {/* Travelled segments */}
        {path.slice(0, animStep + 1).map((p, i) => {
          if (i === 0) return null;
          const prev = path[i - 1];
          const left = Math.min(prev, p) / diskSize * 100;
          const width = Math.abs(p - prev) / diskSize * 100;
          return (
            <div key={i} style={{
              position: "absolute", left: `${left}%`, width: `${Math.max(width, 0.3)}%`,
              top: 16, height: 16,
              background: color + "30", borderRadius: 2,
              borderTop: `2px solid ${color}60`
            }} />
          );
        })}

        {/* Head needle */}
        <div style={{
          position: "absolute", left: `${pct}%`, top: 0, bottom: 0,
          width: 3, background: color,
          boxShadow: `0 0 10px ${color}99`,
          transition: "left 0.45s cubic-bezier(0.4,0,0.2,1)",
          transform: "translateX(-50%)", borderRadius: 2,
          zIndex: 10
        }}>
          {/* Dot at top */}
          <div style={{
            position: "absolute", top: 4, left: "50%",
            transform: "translateX(-50%)",
            width: 10, height: 10,
            background: color, borderRadius: "50%",
            boxShadow: `0 0 8px ${color}`
          }} />
        </div>

        {/* ── Cylinder labels below the needle, for each visited stop ── */}
        {upcomingLabels.map((cylVal, i) => {
          const lPct = (cylVal / diskSize) * 100;
          const isHead = i === animStep; // current head position
          return (
            <div key={i} style={{
              position: "absolute",
              left: `${lPct}%`,
              top: 52,                        // just below the track bar
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: 5
            }}>
              {/* Tick mark */}
              <div style={{
                width: 1.5,
                height: isHead ? 10 : 6,
                background: isHead ? color : color + "70",
                borderRadius: 1,
                marginBottom: 2
              }} />
              {/* Label */}
              <span style={{
                fontSize: isHead ? 11 : 9,
                fontFamily: "'DM Mono', monospace",
                fontWeight: isHead ? 700 : 400,
                color: isHead ? color : color + "90",
                whiteSpace: "nowrap",
                background: isHead ? color + "15" : "transparent",
                border: isHead ? `1px solid ${color}40` : "none",
                borderRadius: 4,
                padding: isHead ? "1px 5px" : "0",
                transition: "all 0.3s"
              }}>
                {cylVal}
              </span>
            </div>
          );
        })}
      </div>

      {/* Extra bottom space so labels don't get clipped */}
      <div style={{ height: 36 }} />
    </div>
  );
}
// ── Compare Bar ─────────────────────────────────────────────────────────────

function CompareBar({ results }) {
  const max = Math.max(...Object.values(results).map(r => r.seek), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ALGORITHMS.map(a => {
        const r = results[a];
        if (!r) return null;
        const pct = (r.seek / max) * 100;
        const c = ALGO_COLORS[a];
        return (
          <div key={a} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              width: 60, fontFamily: "'DM Mono',monospace", fontSize: 11,
              color: c.primary, textAlign: "right", flexShrink: 0, fontWeight: 600
            }}>{a}</span>
            <div style={{
              flex: 1, height: 28, background: "#f1f5f9",
              border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", position: "relative"
            }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: `linear-gradient(90deg, ${c.primary}40, ${c.primary}80)`,
                borderRight: `3px solid ${c.primary}`,
                transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                display: "flex", alignItems: "center", paddingLeft: 10, minWidth: 36
              }}>
                <span style={{
                  color: c.primary, fontFamily: "'DM Mono',monospace",
                  fontSize: 12, fontWeight: 700
                }}>{r.seek}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [requestInput, setRequestInput] = useState("98, 183, 37, 122, 14, 124, 65, 67");
  const [headInput, setHeadInput] = useState("53");
  const [selectedAlgo, setSelectedAlgo] = useState("FCFS");
  const [result, setResult] = useState(null);
  const [animStep, setAnimStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [allResults, setAllResults] = useState({});
  const [tab, setTab] = useState("visualize");
  const intervalRef = useRef(null);

  const parseRequests = () =>
    requestInput.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n >= 0 && n < DISK_SIZE);

  const run = useCallback(() => {
    const requests = parseRequests();
    const head = parseInt(headInput) || 0;
    const res = runAlgo(selectedAlgo, requests, head);
    setResult(res); setAnimStep(0); setPlaying(false);
  }, [requestInput, headInput, selectedAlgo]);

  const runAll = useCallback(() => {
    const requests = parseRequests();
    const head = parseInt(headInput) || 0;
    const results = {};
    ALGORITHMS.forEach(a => { results[a] = runAlgo(a, requests, head); });
    setAllResults(results);
  }, [requestInput, headInput]);

  useEffect(() => { run(); }, []);

  useEffect(() => {
    if (playing && result) {
      intervalRef.current = setInterval(() => {
        setAnimStep(s => {
          if (s >= result.path.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 500);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [playing, result]);

  const ac = ALGO_COLORS[selectedAlgo];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 50%, #faf5ff 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#1e293b"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #312e81 50%, #1e1b4b 100%)",
        padding: "28px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 24px #0002"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 2px 12px #6366f180"
            }}>💿</div>
            <div>
              <div style={{
                fontSize: 20, fontWeight: 700, color: "#fff",
                letterSpacing: 0.5
              }}>Disk Scheduling Visualizer</div>
              <div style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1 }}>
                Seek Time Analyzer · 6 Algorithms
              </div>
            </div>
          </div>
        </div>
        <div style={{
          background: "#ffffff10", border: "1px solid #ffffff20",
          borderRadius: 10, padding: "8px 16px", textAlign: "right"
        }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>DISK SIZE</div>
          <div style={{ fontSize: 18, color: "#fff", fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>
            200 <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>cylinders</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>

        {/* Input Card */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 28px",
          boxShadow: "0 2px 16px #0000000a", border: "1px solid #e2e8f0",
          marginBottom: 24
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 16, letterSpacing: 0.5 }}>
            CONFIGURATION
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: 16, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 500 }}>
                Request Queue <span style={{ color: "#94a3b8" }}>(cylinders 0–199)</span>
              </label>
              <input value={requestInput} onChange={e => setRequestInput(e.target.value)}
                style={{
                  width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0",
                  color: "#1e293b", padding: "10px 14px",
                  fontSize: 14, borderRadius: 8, outline: "none",
                  boxSizing: "border-box", fontFamily: "'DM Mono',monospace",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 500 }}>
                Initial Head Position
              </label>
              <input value={headInput} onChange={e => setHeadInput(e.target.value)}
                style={{
                  width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0",
                  color: "#f59e0b", padding: "10px 14px",
                  fontSize: 14, borderRadius: 8, outline: "none",
                  fontFamily: "'DM Mono',monospace", fontWeight: 700,
                  transition: "border-color 0.2s", boxSizing: "border-box"
                }}
                onFocus={e => e.target.style.borderColor = "#f59e0b"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <button onClick={() => {
              const rnd = Array.from({ length: 8 }, () => Math.floor(Math.random() * DISK_SIZE));
              setRequestInput(rnd.join(", "));
              setHeadInput(String(Math.floor(Math.random() * DISK_SIZE)));
            }} style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", color: "#fff",
              padding: "10px 20px", fontSize: 13, fontWeight: 600,
              borderRadius: 8, cursor: "pointer",
              boxShadow: "0 2px 8px #6366f140",
              transition: "opacity 0.2s", whiteSpace: "nowrap"
            }}
            onMouseOver={e => e.target.style.opacity = 0.85}
            onMouseOut={e => e.target.style.opacity = 1}
            >⟳ Randomize</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {[
            { key: "visualize", label: "Visualize", onClick: () => setTab("visualize") },
            { key: "compare",   label: "Compare All", onClick: () => { setTab("compare"); runAll(); } }
          ].map(t => (
            <button key={t.key} onClick={t.onClick} style={{
              background: tab === t.key
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "#fff",
              border: tab === t.key ? "none" : "1.5px solid #e2e8f0",
              color: tab === t.key ? "#fff" : "#64748b",
              padding: "9px 22px", fontSize: 13, fontWeight: 600,
              borderRadius: 8, cursor: "pointer",
              boxShadow: tab === t.key ? "0 2px 12px #6366f140" : "none",
              transition: "all 0.2s"
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── VISUALIZE TAB ── */}
        {tab === "visualize" && (
          <>
            {/* Algorithm Buttons */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: "20px 24px",
              boxShadow: "0 2px 16px #0000000a", border: "1px solid #e2e8f0",
              marginBottom: 20
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 14, letterSpacing: 0.5 }}>
                SELECT ALGORITHM
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {ALGORITHMS.map(a => {
                  const c = ALGO_COLORS[a];
                  const sel = selectedAlgo === a;
                  return (
                    <button key={a} onClick={() => setSelectedAlgo(a)} style={{
                      background: sel ? c.primary : c.light,
                      border: `1.5px solid ${sel ? c.primary : c.border}`,
                      color: sel ? "#fff" : c.primary,
                      padding: "8px 18px", fontSize: 13, fontWeight: 600,
                      borderRadius: 8, cursor: "pointer",
                      boxShadow: sel ? `0 2px 10px ${c.primary}50` : "none",
                      transition: "all 0.2s"
                    }}>{a}</button>
                  );
                })}
                <button onClick={run} style={{
                  marginLeft: "auto",
                  background: "linear-gradient(135deg, #1e293b, #334155)",
                  border: "none", color: "#fff",
                  padding: "8px 24px", fontSize: 13, fontWeight: 600,
                  borderRadius: 8, cursor: "pointer",
                  boxShadow: "0 2px 10px #0003",
                  transition: "opacity 0.2s"
                }}
                onMouseOver={e => e.target.style.opacity = 0.85}
                onMouseOut={e => e.target.style.opacity = 1}
                >▶ Run</button>
              </div>
            </div>

            {result && (
              <>
                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
                  {[
                    { label: "Algorithm", val: selectedAlgo, color: ac.primary,
                      bg: `linear-gradient(135deg, ${ac.primary}18, ${ac.primary}08)`, border: ac.border },
                    { label: "Total Seek Time", val: result.seek + " cyl", color: "#f59e0b",
                      bg: "linear-gradient(135deg, #fef3c720, #fef9c308)", border: "#fcd34d60" },
                    { label: "Requests Served", val: result.order.length, color: "#10b981",
                      bg: "linear-gradient(135deg, #d1fae520, #ecfdf508)", border: "#6ee7b760" },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: s.bg, border: `1px solid ${s.border}`,
                      borderRadius: 14, padding: "18px 20px",
                      boxShadow: "0 2px 12px #0000000a"
                    }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                        letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>{s.label}</div>
                      <div style={{ fontSize: 26, color: s.color, fontWeight: 800,
                        fontFamily: "'DM Mono',monospace" }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Disk Track Card */}
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "20px 24px",
                  boxShadow: "0 2px 16px #0000000a", border: "1px solid #e2e8f0",
                  marginBottom: 20
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b",
                    marginBottom: 4, letterSpacing: 0.5 }}>DISK TRACK</div>
                  <DiskTrack path={result.path} animStep={animStep} diskSize={DISK_SIZE} color={ac.primary} />

                  {/* Controls */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14 }}>
                    {[
                      { label: "⏮", action: () => setAnimStep(0) },
                      { label: "◀", action: () => setAnimStep(s => Math.max(0, s - 1)) },
                    ].map((b, i) => (
                      <button key={i} onClick={b.action} style={{
                        background: "#f8fafc", border: "1.5px solid #e2e8f0",
                        color: "#475569", padding: "7px 14px", fontSize: 13,
                        borderRadius: 8, cursor: "pointer", fontWeight: 600
                      }}>{b.label}</button>
                    ))}
                    <button onClick={() => setPlaying(p => !p)} style={{
                      background: playing
                        ? "linear-gradient(135deg, #ef4444, #f97316)"
                        : `linear-gradient(135deg, ${ac.primary}, ${ac.primary}cc)`,
                      border: "none", color: "#fff",
                      padding: "7px 22px", fontSize: 13, fontWeight: 600,
                      borderRadius: 8, cursor: "pointer", minWidth: 96,
                      boxShadow: `0 2px 10px ${ac.primary}50`
                    }}>{playing ? "⏸ Pause" : "▶ Play"}</button>
                    {[
                      { label: "▶", action: () => setAnimStep(s => Math.min(result.path.length - 1, s + 1)) },
                      { label: "⏭", action: () => setAnimStep(result.path.length - 1) },
                    ].map((b, i) => (
                      <button key={i} onClick={b.action} style={{
                        background: "#f8fafc", border: "1.5px solid #e2e8f0",
                        color: "#475569", padding: "7px 14px", fontSize: 13,
                        borderRadius: 8, cursor: "pointer", fontWeight: 600
                      }}>{b.label}</button>
                    ))}
                    <div style={{
                      marginLeft: 12, background: "#f1f5f9",
                      border: "1px solid #e2e8f0", borderRadius: 6,
                      padding: "5px 12px",
                      color: "#64748b", fontSize: 12,
                      fontFamily: "'DM Mono',monospace"
                    }}>
                      Step {animStep} / {result.path.length - 1}
                    </div>
                  </div>
                </div>

                {/* Seek Chart Card */}
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "20px 24px",
                  boxShadow: "0 2px 16px #0000000a", border: "1px solid #e2e8f0",
                  marginBottom: 20
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b",
                    marginBottom: 10, letterSpacing: 0.5 }}>SEEK PATTERN</div>
                  <div style={{ height: 260 }}>
                    <SeekChart path={result.path} diskSize={DISK_SIZE}
                      animStep={animStep} color={ac.primary} />
                  </div>
                </div>

                {/* Service Order */}
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "20px 24px",
                  boxShadow: "0 2px 16px #0000000a", border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b",
                    marginBottom: 14, letterSpacing: 0.5 }}>SERVICE ORDER</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.order.map((r, i) => (
                      <div key={i} style={{
                        background: i < animStep ? ac.light : "#f8fafc",
                        border: `1.5px solid ${i < animStep ? ac.border : "#e2e8f0"}`,
                        color: i < animStep ? ac.primary : "#64748b",
                        padding: "6px 14px", borderRadius: 8, fontSize: 13,
                        fontFamily: "'DM Mono',monospace", fontWeight: 600,
                        transition: "all 0.3s",
                        boxShadow: i < animStep ? `0 2px 8px ${ac.primary}20` : "none"
                      }}>
                        <span style={{
                          fontSize: 10, color: i < animStep ? ac.primary + "80" : "#cbd5e1",
                          marginRight: 5
                        }}>{i + 1}</span>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── COMPARE TAB ── */}
        {tab === "compare" && Object.keys(allResults).length > 0 && (
          <>
            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
              {ALGORITHMS.map(a => {
                const r = allResults[a];
                if (!r) return null;
                const c = ALGO_COLORS[a];
                const best = Math.min(...Object.values(allResults).map(x => x.seek));
                const isBest = r.seek === best;
                return (
                  <div key={a} style={{
                    background: "#fff",
                    border: `1.5px solid ${isBest ? c.primary : "#e2e8f0"}`,
                    borderRadius: 14, padding: "18px 20px",
                    boxShadow: isBest ? `0 4px 20px ${c.primary}25` : "0 2px 12px #0000000a",
                    position: "relative", overflow: "hidden",
                    transition: "transform 0.2s"
                  }}>
                    {isBest && (
                      <div style={{
                        position: "absolute", top: 0, right: 0,
                        background: `linear-gradient(135deg, ${c.primary}, ${c.primary}cc)`,
                        color: "#fff", fontSize: 10, fontWeight: 700,
                        padding: "4px 10px", borderBottomLeftRadius: 8, letterSpacing: 0.5
                      }}>✓ BEST</div>
                    )}
                    <div style={{
                      display: "inline-block",
                      background: c.light, border: `1px solid ${c.border}`,
                      color: c.primary, fontSize: 12, fontWeight: 700,
                      padding: "3px 10px", borderRadius: 6, marginBottom: 10
                    }}>{a}</div>
                    <div style={{
                      fontSize: 30, color: "#1e293b", fontWeight: 800,
                      fontFamily: "'DM Mono',monospace", lineHeight: 1
                    }}>{r.seek}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>total cylinders</div>
                    <div style={{
                      marginTop: 10, height: 3, borderRadius: 2,
                      background: "#f1f5f9", overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${(r.seek / Math.max(...Object.values(allResults).map(x => x.seek))) * 100}%`,
                        height: "100%", background: c.primary, borderRadius: 2,
                        transition: "width 0.8s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bar Chart */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: "24px 28px",
              boxShadow: "0 2px 16px #0000000a", border: "1px solid #e2e8f0",
              marginBottom: 20
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b",
                marginBottom: 18, letterSpacing: 0.5 }}>SEEK TIME COMPARISON</div>
              <CompareBar results={allResults} />
            </div>

            {/* Algorithm Notes */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: "24px 28px",
              boxShadow: "0 2px 16px #0000000a", border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b",
                marginBottom: 16, letterSpacing: 0.5 }}>ALGORITHM REFERENCE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["FCFS",   "Services requests in arrival order. Simple and fair but often inefficient with large seek distances."],
                  ["SSTF",   "Always picks the nearest request. Minimizes individual seeks but risks starvation of far requests."],
                  ["SCAN",   "Sweeps end-to-end like an elevator, servicing requests in both directions. Good throughput."],
                  ["C-SCAN", "Services in one direction only, then jumps back to start. Provides more uniform wait times."],
                  ["LOOK",   "Like SCAN but reverses at the last request rather than disk boundary. More efficient."],
                  ["C-LOOK", "Like C-SCAN but jumps to the lowest request. Best balance of fairness and efficiency."]
                ].map(([a, d]) => {
                  const c = ALGO_COLORS[a];
                  return (
                    <div key={a} style={{
                      display: "flex", gap: 12, padding: "12px 14px",
                      background: c.light, border: `1px solid ${c.border}`,
                      borderRadius: 10
                    }}>
                      <span style={{
                        flexShrink: 0, color: c.primary, fontWeight: 700,
                        fontSize: 12, width: 56,
                        fontFamily: "'DM Mono',monospace"
                      }}>{a}</span>
                      <span style={{ color: "#475569", fontSize: 12, lineHeight: 1.5 }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}