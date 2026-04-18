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
      display: "inline-flex", alignItem
