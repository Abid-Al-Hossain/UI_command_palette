"use client";

import { useEffect, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { CommandPaletteState } from "../types";
import { getCommandPaletteModel } from "../_utils/commandPaletteModel";

function shell(state: CommandPaletteState): CSSProperties {
  return {
    width: state.width,
    minHeight: state.height,
    padding: state.padding,
    gap: state.gap,
    borderRadius: state.radius,
    border: `${state.borderWidth}px solid ${state.border}`,
    boxShadow: `0 ${Math.round(state.shadow / 3)}px ${state.shadow}px rgba(0,0,0,.28)`,
    background: state.background,
    color: state.foreground,
    fontFamily: state.fontFamily,
    opacity: state.disabled ? 0.55 : 1,
  };
}

export default function LivePreview({ state }: { state: CommandPaletteState }) {
  const model = getCommandPaletteModel(state);
  const [isOpen, setIsOpen] = useState(model.isInitiallyOpen);
  const [activeIndex, setActiveIndex] = useState(model.activeIndex);
  const [query, setQuery] = useState(model.query);

  useEffect(() => {
    setIsOpen(model.isInitiallyOpen);
    setActiveIndex(model.activeIndex);
    setQuery(model.query);
  }, [model.activeIndex, model.isInitiallyOpen, model.query, state.id, state.itemCount, state.groupCount]);

  const activeDescendant = isOpen && activeIndex >= 0 ? `${model.baseId}-option-${activeIndex}` : undefined;
  const describedBy = model.isError ? `${model.helperId} ${model.errorId}` : model.helperId;

  const moveActive = (delta: number) => {
    if (!model.totalOptions) return;
    setActiveIndex((current) => (current + delta + model.totalOptions) % model.totalOptions);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      moveActive(1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      moveActive(-1);
    }

    if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      setIsOpen(false);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="grid place-items-center">
      <section id={state.id} role="dialog" aria-modal="false" aria-labelledby={model.labelId} aria-describedby={describedBy} style={shell(state)} className="grid">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id={model.labelId} style={{ fontSize: state.titleSize, fontWeight: state.fontWeight }}>{state.title}</h3>
            <p className="mt-1" style={{ color: state.muted, fontSize: state.bodySize }}>{state.description}</p>
          </div>
          <button id={model.triggerId} type="button" disabled={state.disabled} aria-label={isOpen ? "Close command palette" : "Open command palette"} aria-expanded={isOpen} aria-controls={model.listboxId} onClick={() => setIsOpen((value) => !value)} className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: state.border, color: state.accent, transition: state.motion ? "background 0.15s ease, border-color 0.15s ease" : "none" }}>
            {isOpen ? "Open" : "Closed"}
          </button>
        </div>

        <label className="grid gap-2 text-sm font-semibold" htmlFor={model.inputId}>
          <span>{model.inputLabel}</span>
          <input id={model.inputId} role="combobox" type="search" disabled={state.disabled} value={query} placeholder={model.placeholder} aria-expanded={isOpen} aria-controls={model.listboxId} aria-activedescendant={activeDescendant} aria-autocomplete="list" aria-describedby={describedBy} onFocus={() => setIsOpen(true)} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleInputKeyDown} className="rounded-2xl border px-4 py-3 outline-none transition" style={{ borderColor: state.previewState === "focus" ? state.accent : state.border, background: "rgba(255,255,255,.06)", color: state.foreground }} />
        </label>

        <p id={model.helperId} className="text-xs" style={{ color: state.muted }}>{state.helper} - {model.resultLabel}</p>
        {model.isError && <p id={model.errorId} role="alert" className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: state.border, color: state.accent }}>{model.errorMessage}</p>}

        {isOpen && (
          <div id={model.listboxId} role="listbox" aria-label={model.inputLabel} className="grid gap-3 rounded-3xl border p-3" style={{ borderColor: state.border, background: "rgba(2,6,23,.18)", transition: state.motion ? "opacity 0.2s ease" : "none" }}>
            {model.isLoading && <div role="status" className="rounded-2xl px-4 py-3 text-sm" style={{ color: state.muted }}>{model.loadingMessage}</div>}
            {!model.isLoading && model.isEmpty && <div role="status" className="rounded-2xl px-4 py-3 text-sm" style={{ color: state.muted }}>{model.emptyMessage}</div>}
            {!model.isLoading && !model.isEmpty && model.groups.map((group) => (
              <div key={group.id} role="group" aria-label={group.label} className="grid gap-2">
                <p className="px-2 text-xs uppercase tracking-[0.18em]" style={{ color: state.muted }}>{group.label}</p>
                {group.options.map((option) => {
                  const optionIndex = Number(option.id.split("-").at(-1));
                  const selected = optionIndex === activeIndex || state.previewState === "selected";

                  return (
                    <div key={option.id} id={option.id} role="option" aria-selected={selected} className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: selected ? state.accent : "transparent", background: selected ? "rgba(255,255,255,.1)" : "transparent", transition: state.motion ? "background 0.15s ease, border-color 0.15s ease" : "none" }}>
                      <span>
                        <strong>{option.label}</strong>
                        <small className="block" style={{ color: state.muted }}>{option.helper}</small>
                      </span>
                      {state.showShortcuts && <kbd className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: state.border, color: state.muted }}>{option.shortcut}</kbd>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
