"use client";

import { useMemo, useState } from "react";
import Input from "@/components/shared/input/Input";
import Select from "@/components/shared/input/Select";
import { SectionCard } from "@/components/shared/layout/SectionCard";
import { COMMANDPALETTE_PRESETS } from "../_data/CommandPalettePresets";
import type { StudioPreset } from "../types";

const PAGE_SIZE = 8;

export default function PresetsSection({ activePresetId, onApply }: { activePresetId: string | null; onApply: (preset: StudioPreset) => void }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [size, setSize] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const families = useMemo(() => ["all", ...Array.from(new Set(COMMANDPALETTE_PRESETS.map((preset) => preset.family)))], []);
  const sizes = useMemo(() => ["all", ...Array.from(new Set(COMMANDPALETTE_PRESETS.map((preset) => preset.size)))], []);
  const filtered = useMemo(() => COMMANDPALETTE_PRESETS.filter((preset) => [preset.family, preset.archetype, preset.variant, preset.size, ...preset.tags].join(" ").toLowerCase().includes(query.toLowerCase()) && (family === "all" || preset.family === family) && (size === "all" || preset.size === size)), [family, query, size]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visiblePresets = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const hasFilters = query.trim() !== "" || family !== "all" || size !== "all";
  const resultCopy = `${filtered.length} of ${COMMANDPALETTE_PRESETS.length} presets`;
  const source = filtered.length ? filtered : COMMANDPALETTE_PRESETS;
const resetFilters = () => {
    setQuery("");
    setFamily("all");
    setSize("all");
    setCurrentPage(1);
  };

  return (
    <SectionCard title="Presets" subtitle="48 structured full-state presets.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Search presets" value={query} onChange={(value) => { setQuery(value); setCurrentPage(1); }} data-filter="query" />
        <Select label="Family" value={family} options={families} onChange={(value) => { setFamily(value); setCurrentPage(1); }} />
        <Select label="Size" value={size} options={sizes} onChange={(value) => { setSize(value); setCurrentPage(1); }} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        <span aria-live="polite">{resultCopy} - page {currentPage} of {pageCount}</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={resetFilters} disabled={!hasFilters} className="rounded-xl border px-4 py-2 font-semibold disabled:opacity-45" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Reset filters</button>
          <button type="button" onClick={() => onApply(source[Math.floor(Math.random() * source.length)])} className="rounded-xl border px-4 py-2 font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Surprise me</button>
        </div>
      </div>

      {visiblePresets.length === 0 && (
        <div role="status" className="rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          No presets match the current filters. Reset filters to browse every command palette preset.
        </div>
      )}

      <div className="grid gap-3" data-result-count={filtered.length} data-page={currentPage}>
        {visiblePresets.map((preset) => {
          const applied = activePresetId === preset.id;

          return (
            <button key={preset.id} type="button" onClick={() => onApply(preset)} data-preset-id={preset.id} data-applied={applied} aria-pressed={applied} className="rounded-2xl border p-4 text-left" style={{ borderColor: applied ? "var(--primary)" : "var(--border)", background: applied ? "color-mix(in oklab, var(--primary) 20%, transparent)" : "color-mix(in oklab, var(--card) 65%, transparent)", color: "var(--text)" }}>
              <strong>{preset.archetype}</strong>
              <span className="ml-2 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--muted)" }}>{preset.variant} / {preset.size}</span>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{preset.family} - {preset.tags.join(", ")}</p>
            </button>
          );
        })}
      </div>

      <nav aria-label="Preset pages" className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-45" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Previous</button>
        <span className="text-sm" style={{ color: "var(--muted)" }}>Page {currentPage} / {pageCount}</span>
        <button type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-45" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Next</button>
      </nav>
    </SectionCard>
  );
}
