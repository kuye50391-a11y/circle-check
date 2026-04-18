"use client";
import { useState, useEffect, useCallback } from "react";

const T = {
  bg: "#fdf6f0",
  card: "#ffffff",
  accent: "#e8a0bf",
  accentLight: "#fce4ec",
  text: "#5a4a5a",
  textSoft: "#9b8a9b",
  textMuted: "#c4b4c4",
  border: "#f0e4e8",
  inputBg: "#fef9f6",
  shadow: "0 2px 8px rgba(180,140,160,0.08)",
  radius: "14px",
  radiusSm: "10px",
};

const PRIORITY_CONFIG = {
  must: { label: "絶対", color: "#e57396", bg: "#fce4ec", dot: "#e57396", sort: 1 },
  want: { label: "できれば", color: "#f0a868", bg: "#fff3e0", dot: "#f0a868", sort: 2 },
  maybe: { label: "余裕あれば", color: "#a8c4d8", bg: "#e8f0f8", dot: "#a8c4d8", sort: 3 },
};

const EMPTY_CIRCLE = { id: "", name: "", space: "", priority: "must", items: [], memo: "" };
const EMPTY_ITEM = { title: "", price: "", type: "new" };

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const STORAGE_KEY = "circlecheck-data";
const DEFAULT_DATA = { events: [], activeEventId: null };

function loadData() {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.events)) return parsed;
    }
  } catch (e) {}
  return DEFAULT_DATA;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: 700,
      color: cfg.color, background: cfg.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function ItemTypeTag({ type }) {
  const isNew = type === "new";
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, padding: "2px 7px",
      borderRadius: "8px",
      color: isNew ? "#e57396" : T.textSoft,
      background: isNew ? "#fce4ec" : "#f0eaef",
    }}>
      {isNew ? "新刊" : "既刊"}
    </span>
  );
}

function CircleCard({ circle, onEdit, onDelete }) {
  const cfg = PRIORITY_CONFIG[circle.priority];
  return (
    <div style={{
      background: T.card, borderRadius: T.radius,
      padding: "16px 18px", marginBottom: "12px",
      boxShadow: T.shadow, borderLeft: `4px solid ${cfg.dot}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "15px", color: T.text }}>
              {circle.name || "(名称未設定)"}
            </span>
            <PriorityBadge priority={circle.priority} />
          </div>
          {circle.space && (
            <div style={{
              fontSize: "12px", color: T.accent, marginTop: "5px",
              fontWeight: 500, background: T.accentLight,
              display: "inline-block", padding: "2px 8px", borderRadius: "6px",
            }}>
              {circle.space}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          <button onClick={() => onEdit(circle)} style={iconBtnStyle}>
            <svg width="15" height="15" fill="none" stroke={T.textSoft} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={() => onDelete(circle.id)} style={iconBtnStyle}>
            <svg width="15" height="15" fill="none" stroke={T.textSoft} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>

      {circle.items.length > 0 && (
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
          {circle.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", color: T.text,
              background: "#fdf8f5", borderRadius: "8px", padding: "5px 8px",
            }}>
              <ItemTypeTag type={item.type} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.title || "(タイトル未入力)"}
              </span>
              {item.price && (
                <span style={{ fontSize: "12px", color: T.textSoft, flexShrink: 0, fontWeight: 500 }}>
                  {item.price}円
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {circle.memo && (
        <div style={{
          marginTop: "10px", fontSize: "12px", color: T.textSoft,
          lineHeight: 1.6, whiteSpace: "pre-wrap",
          background: "#fdf8f5", borderRadius: "8px", padding: "8px 10px",
        }}>
          {circle.memo}
        </div>
      )}
    </div>
  );
}

const iconBtnStyle = {
  background: T.inputBg, border: `1px solid ${T.border}`,
  borderRadius: "10px", width: "34px", height: "34px",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};

function CircleForm({ circle, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_CIRCLE, ...circle,
    items: circle?.items?.length ? circle.items.map(it => ({ ...it })) : [],
  }));
  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, val) =>
    setForm(f => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) }));

  const handleSave = () => {
    if (!form.name.trim() && !form.space.trim()) return;
    onSave({ ...form, id: form.id || generateId() });
  };

  return (
    <div style={modalOverlay} onClick={onCancel}>
      <div style={modalContent} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: T.text, fontWeight: 700 }}>
            {circle?.id ? "サークル編集" : "サークル追加"}
          </h3>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            <svg width="20" height="20" fill="none" stroke={T.textMuted} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>サークル名</label>
          <input style={inputStyle} value={form.name} onChange={e => update("name", e.target.value)} placeholder="サークル名を入力" />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>スペース番号</label>
          <input style={inputStyle} value={form.space} onChange={e => update("space", e.target.value)} placeholder="例: A-01a" />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>優先度</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => update("priority", key)} style={{
                flex: 1, padding: "10px 4px", borderRadius: T.radiusSm,
                border: form.priority === key ? `2px solid ${cfg.color}` : `1.5px solid ${T.border}`,
                background: form.priority === key ? cfg.bg : "#fff",
                color: form.priority === key ? cfg.color : T.textSoft,
                fontWeight: form.priority === key ? 700 : 500,
                fontSize: "13px", cursor: "pointer",
              }}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div style={fieldGroup}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>頒布物</label>
            <button onClick={addItem} style={{
              ...smallBtnStyle, color: T.accent, borderColor: `${T.accent}40`,
            }}>+ 追加</button>
          </div>
          {form.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" }}>
              <button onClick={() => updateItem(i, "type", item.type === "new" ? "old" : "new")} style={{
                ...smallBtnStyle, fontSize: "10px", padding: "5px 7px", minWidth: "36px",
                color: item.type === "new" ? "#e57396" : T.textSoft,
                background: item.type === "new" ? "#fce4ec" : "#f0eaef",
                borderColor: "transparent", fontWeight: 700,
              }}>
                {item.type === "new" ? "新刊" : "既刊"}
              </button>
              <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                value={item.title} onChange={e => updateItem(i, "title", e.target.value)} placeholder="タイトル" />
              <input style={{ ...inputStyle, width: "60px", marginBottom: 0, textAlign: "right" }}
                value={item.price} onChange={e => updateItem(i, "price", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="円" inputMode="numeric" />
              <button onClick={() => removeItem(i)} style={{ ...iconBtnStyle, width: "28px", height: "28px" }}>
                <svg width="13" height="13" fill="none" stroke={T.textMuted} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>メモ</label>
          <textarea style={{ ...inputStyle, minHeight: "64px", resize: "vertical", lineHeight: 1.6 }}
            value={form.memo} onChange={e => update("memo", e.target.value)}
            placeholder="買い物メモ、注意点など" />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onCancel} style={{
            ...btnStyle, flex: 1, background: "#f5eef2", color: T.textSoft,
          }}>やめる</button>
          <button onClick={handleSave} style={{
            ...btnStyle, flex: 1, background: `linear-gradient(135deg, ${T.accent}, #d4a0c8)`, color: "#fff",
            boxShadow: "0 2px 10px rgba(229,115,150,0.25)",
          }}>保存する</button>
        </div>
      </div>
    </div>
  );
}

function EventSelector({ events, activeId, onSelect, onAdd, onDelete, onRename }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
    setAdding(false);
  };

  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px", WebkitOverflowScrolling: "touch" }}>
        {events.map(ev => (
          <div key={ev.id} style={{ flexShrink: 0 }}>
            {editingId === ev.id ? (
              <div style={{ display: "flex", gap: "4px" }}>
                <input style={{ ...inputStyle, width: "100px", marginBottom: 0, fontSize: "12px", padding: "7px 10px" }}
                  value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { onRename(ev.id, editName); setEditingId(null); } }}
                  autoFocus />
                <button onClick={() => { onRename(ev.id, editName); setEditingId(null); }}
                  style={{ ...smallBtnStyle, fontSize: "11px" }}>OK</button>
              </div>
            ) : (
              <button onClick={() => onSelect(ev.id)}
                onDoubleClick={() => { setEditingId(ev.id); setEditName(ev.name); }}
                style={{
                  padding: "8px 16px", borderRadius: "20px",
                  border: ev.id === activeId ? `2px solid ${T.accent}` : `1.5px solid ${T.border}`,
                  background: ev.id === activeId ? T.accentLight : "#fff",
                  color: ev.id === activeId ? T.accent : T.textSoft,
                  fontSize: "13px", fontWeight: ev.id === activeId ? 700 : 500,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                {ev.name}
                <span style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.6 }}>({ev.circles.length})</span>
              </button>
            )}
          </div>
        ))}
        {adding ? (
          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
            <input style={{ ...inputStyle, width: "120px", marginBottom: 0, fontSize: "12px", padding: "7px 10px" }}
              value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              placeholder="イベント名" autoFocus />
            <button onClick={handleAdd} style={{ ...smallBtnStyle, fontSize: "11px" }}>OK</button>
            <button onClick={() => setAdding(false)} style={{ ...smallBtnStyle, fontSize: "11px", color: T.textMuted }}>x</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
            ...smallBtnStyle, flexShrink: 0, borderRadius: "20px",
            padding: "8px 14px", color: T.accent,
            borderColor: `${T.accent}40`, background: "#fff",
          }}>+ イベント</button>
        )}
      </div>
      {activeId && events.length > 1 && (
        <button onClick={() => { if (confirm("このイベントを削除しますか?")) onDelete(activeId); }}
          style={{ fontSize: "11px", color: T.textMuted, background: "none", border: "none", cursor: "pointer", marginTop: "4px", padding: 0 }}>
          このイベントを削除
        </button>
      )}
    </div>
  );
}

function FilterBar({ sort, setSort, filter, setFilter }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
      <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
        <option value="priority">優先度順</option>
        <option value="space">スペース番号順</option>
        <option value="name">名前順</option>
      </select>
      <select value={filter} onChange={e => setFilter(e.target.value)} style={selectStyle}>
        <option value="all">すべて</option>
        <option value="must">絶対</option>
        <option value="want">できれば</option>
        <option value="maybe">余裕あれば</option>
      </select>
    </div>
  );
}

function BudgetSummary({ circles }) {
  const total = circles.reduce((sum, c) => sum + c.items.reduce((s, it) => s + (parseInt(it.price) || 0), 0), 0);
  if (total === 0) return null;
  return (
    <div style={{
      fontSize: "13px", color: T.text, marginBottom: "14px",
      padding: "10px 14px", background: T.accentLight,
      borderRadius: T.radiusSm, display: "flex",
      justifyContent: "space-between",
    }}>
      <span>予算めやす</span>
      <span style={{ fontWeight: 700, color: T.accent }}>{total.toLocaleString()}円</span>
    </div>
  );
}

export default function CircleCheck() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [mounted, setMounted] = useState(false);
  const [editingCircle, setEditingCircle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState("priority");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setData(loadData());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveData(data);
  }, [data, mounted]);

  const activeEvent = data.events.find(ev => ev.id === data.activeEventId);

  const addEvent = (name) => {
    const ev = { id: generateId(), name, circles: [] };
    setData(d => ({ events: [...d.events, ev], activeEventId: ev.id }));
  };
  const deleteEvent = (id) => setData(d => {
    const events = d.events.filter(ev => ev.id !== id);
    return { events, activeEventId: events.length ? events[0].id : null };
  });
  const renameEvent = (id, name) => {
    if (!name.trim()) return;
    setData(d => ({ ...d, events: d.events.map(ev => ev.id === id ? { ...ev, name: name.trim() } : ev) }));
  };
  const selectEvent = (id) => setData(d => ({ ...d, activeEventId: id }));

  const saveCircle = (circle) => {
    setData(d => ({
      ...d, events: d.events.map(ev => {
        if (ev.id !== d.activeEventId) return ev;
        const exists = ev.circles.find(c => c.id === circle.id);
        return { ...ev, circles: exists ? ev.circles.map(c => c.id === circle.id ? circle : c) : [...ev.circles, circle] };
      }),
    }));
    setShowForm(false); setEditingCircle(null);
  };

  const deleteCircle = (circleId) => {
    if (!confirm("このサークルを削除しますか?")) return;
    setData(d => ({
      ...d, events: d.events.map(ev =>
        ev.id === d.activeEventId ? { ...ev, circles: ev.circles.filter(c => c.id !== circleId) } : ev),
    }));
  };

  const getDisplayCircles = useCallback(() => {
    if (!activeEvent) return [];
    let list = [...activeEvent.circles];
    if (filter !== "all") list = list.filter(c => c.priority === filter);
    list.sort((a, b) => {
      if (sort === "priority") return PRIORITY_CONFIG[a.priority].sort - PRIORITY_CONFIG[b.priority].sort;
      if (sort === "space") return (a.space || "zzz").localeCompare(b.space || "zzz");
      return (a.name || "").localeCompare(b.name || "");
    });
    return list;
  }, [activeEvent, sort, filter]);

  if (!mounted) {
    return (
      <div style={{ ...appContainer, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ color: T.textMuted, fontSize: "14px" }}>よみこみ中...</span>
      </div>
    );
  }

  const displayCircles = getDisplayCircles();

  return (
    <div style={appContainer}>
      <header style={{ marginBottom: "22px", textAlign: "center" }}>
        <h1 style={{
          margin: 0, fontSize: "20px", fontWeight: 700,
          color: T.text, letterSpacing: "0.04em",
        }}>
          サークルチェック
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: T.textMuted }}>
          即売会のおともに
        </p>
      </header>

      <EventSelector events={data.events} activeId={data.activeEventId}
        onSelect={selectEvent} onAdd={addEvent} onDelete={deleteEvent} onRename={renameEvent} />

      {!activeEvent ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: T.textMuted }}>
          <p style={{ fontSize: "14px", margin: 0 }}>イベントを追加してはじめよう</p>
        </div>
      ) : (
        <>
          <FilterBar sort={sort} setSort={setSort} filter={filter} setFilter={setFilter} />
          <BudgetSummary circles={filter === "all" ? activeEvent.circles : displayCircles} />

          {displayCircles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: T.textMuted, fontSize: "13px" }}>
              {activeEvent.circles.length === 0
                ? "サークルを追加しよう"
                : "該当するサークルがありません"}
            </div>
          ) : (
            displayCircles.map(c => (
              <CircleCard key={c.id} circle={c}
                onEdit={(c) => { setEditingCircle(c); setShowForm(true); }}
                onDelete={deleteCircle} />
            ))
          )}

          <button onClick={() => { setEditingCircle(null); setShowForm(true); }} style={{
            position: "fixed", bottom: "28px", right: "28px",
            width: "54px", height: "54px", borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.accent}, #d4a0c8)`,
            color: "#fff", border: "none", fontSize: "24px", fontWeight: 300,
            cursor: "pointer", zIndex: 50, display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 18px rgba(229,115,150,0.3)",
          }}>
            +
          </button>
        </>
      )}

      {showForm && (
        <CircleForm circle={editingCircle} onSave={saveCircle}
          onCancel={() => { setShowForm(false); setEditingCircle(null); }} />
      )}
    </div>
  );
}

const appContainer = {
  maxWidth: "480px", margin: "0 auto",
  padding: "24px 16px 90px",
  background: T.bg, minHeight: "100vh",
  boxSizing: "border-box",
};

const modalOverlay = {
  position: "fixed", inset: 0,
  background: "rgba(90,74,90,0.3)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  zIndex: 100, display: "flex",
  alignItems: "flex-end", justifyContent: "center",
};

const modalContent = {
  background: "#fff",
  borderRadius: "20px 20px 0 0",
  padding: "24px 20px 32px",
  width: "100%", maxWidth: "480px",
  maxHeight: "88vh", overflowY: "auto",
  boxSizing: "border-box",
  boxShadow: "0 -4px 30px rgba(180,140,160,0.15)",
};

const fieldGroup = { marginBottom: "16px" };

const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: 700,
  color: T.textSoft, marginBottom: "6px",
};

const inputStyle = {
  width: "100%", padding: "10px 14px",
  borderRadius: T.radiusSm,
  border: `1.5px solid ${T.border}`,
  fontSize: "14px", boxSizing: "border-box",
  outline: "none", background: T.inputBg,
  marginBottom: "2px", color: T.text,
};

const btnStyle = {
  padding: "13px", borderRadius: T.radiusSm,
  border: "none", fontSize: "14px",
  fontWeight: 700, cursor: "pointer",
};

const smallBtnStyle = {
  padding: "5px 10px", borderRadius: "8px",
  border: `1.5px solid ${T.border}`, background: "#fff",
  fontSize: "12px", cursor: "pointer", fontWeight: 600,
};

const selectStyle = {
  padding: "8px 12px", borderRadius: T.radiusSm,
  border: `1.5px solid ${T.border}`, fontSize: "13px",
  background: "#fff", color: T.text, outline: "none",
  cursor: "pointer", fontWeight: 500,
};
