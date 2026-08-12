"use client";

import { useEffect, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { CommandPaletteState } from "../types";
import { SYSTEM_FONTS } from "@/components/shared/typography/fontConstants";
import { getCommandPaletteModel } from "../_utils/commandPaletteModel";

function resolveFont(state: { fontBucket: "system" | "google"; googleFontFamily: string; systemFontIdx: number }): string {
  return state.fontBucket === "google"
    ? `"${state.googleFontFamily}", sans-serif`
    : (SYSTEM_FONTS[state.systemFontIdx]?.css ?? "inherit");
}

function buildShadow(state: { shadowEnabled: boolean; shadowX: number; shadowY: number; shadowBlur: number; shadowSpread: number; shadowColor: string; shadowOpacity: number }): string {
  if (!state.shadowEnabled) return "none";
  const hex = Math.round(state.shadowOpacity * 255).toString(16).padStart(2, "0");
  return `${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${state.shadowSpread}px ${state.shadowColor}${hex}`;
}

function buildRadius(state: { radiusLinked: boolean; radius: number; radiusTL: number; radiusTR: number; radiusBR: number; radiusBL: number }): string {
  return state.radiusLinked
    ? `${state.radius}px`
    : `${state.radiusTL}px ${state.radiusTR}px ${state.radiusBR}px ${state.radiusBL}px`;
}

function shell(state: CommandPaletteState): CSSProperties {
  return {
    width: state.width,
    minHeight: state.height,
    padding: state.padding,
    gap: state.gap,
    borderRadius: buildRadius(state),
    border: `${state.borderWidth}px ${state.borderStyle} ${state.disabled && state.disabledUseCustomColors ? state.disabledBorder : state.border}`,
    boxShadow: buildShadow(state),
    background: state.disabled && state.disabledUseCustomColors ? state.disabledBg : state.background,
    color: state.foreground,
    fontFamily: resolveFont(state),
    fontStyle: state.fontStyle,
    textTransform: state.textTransform,
    textDecoration: state.textDecoration,
    letterSpacing: `${state.letterSpacing}${state.letterSpacingUnit}`,
    lineHeight: state.lineHeight,
    opacity: state.disabled ? state.disabledOpacity : 1,
    cursor: state.disabled ? state.disabledCursor : undefined,
  };
}

export default function LivePreview({ state }: { state: CommandPaletteState }) {
  const initialModel = getCommandPaletteModel(state);
  const [isOpen, setIsOpen] = useState(initialModel.isInitiallyOpen);
  const [activeIndex, setActiveIndex] = useState(initialModel.activeIndex);
  const [query, setQuery] = useState(initialModel.query);
  const [debouncedQuery, setDebouncedQuery] = useState(initialModel.query);
  const [announcement, setAnnouncement] = useState("");
  const model = getCommandPaletteModel(state, debouncedQuery);
  const visibleOptions = model.groups.flatMap((group) => group.options);
  const resolvedActiveIndex = visibleOptions.some(
    (option) => option.index === activeIndex,
  )
    ? activeIndex
    : model.activeIndex;
  const isSearching = query !== debouncedQuery;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, Math.max(0, state.searchDebounce));
    return () => clearTimeout(timer);
  }, [query, state.searchDebounce]);

  useEffect(() => {
    if (!state.keyboardShortcut.toLocaleLowerCase().replaceAll(" ", "").endsWith("+k")) return;
    const openFromShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", openFromShortcut);
    return () => document.removeEventListener("keydown", openFromShortcut);
  }, [state.keyboardShortcut]);

  const activeDescendant =
    isOpen && resolvedActiveIndex >= 0
      ? `${model.baseId}-option-${resolvedActiveIndex}`
      : undefined;
  const describedBy = model.isError ? `${model.helperId} ${model.errorId}` : model.helperId;

  const moveActive = (delta: number) => {
    if (!visibleOptions.length) return;
    setActiveIndex((current) => {
      const position = visibleOptions.findIndex((option) => option.index === current);
      return visibleOptions[(Math.max(position, 0) + delta + visibleOptions.length) % visibleOptions.length].index;
    });
  };

  const executeOption = (optionIndex: number) => {
    const option = visibleOptions.find((candidate) => candidate.index === optionIndex);
    if (!option) return;
    setAnnouncement(`${option.label} executed.`);
    setIsOpen(false);
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

    if (event.key === "Enter" && isOpen && resolvedActiveIndex >= 0) {
      event.preventDefault();
      executeOption(resolvedActiveIndex);
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
          <button id={model.triggerId} type="button" disabled={state.disabled} aria-label={isOpen ? "Close command palette" : "Open command palette"} aria-expanded={isOpen} aria-controls={model.listboxId} onClick={() => setIsOpen((value) => !value)} className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: state.border, color: state.accent, transition: state.transitionDuration > 0 ? "background 0.15s ease, border-color 0.15s ease" : "none" }}>
            {isOpen ? "Close" : "Open"}
          </button>
        </div>

        <label className="grid gap-2 text-sm font-semibold" htmlFor={model.inputId}>
          <span>{model.inputLabel}</span>
          <div className="relative">
            <input id={model.inputId} role="combobox" type="search" disabled={state.disabled} value={query} placeholder={model.placeholder} aria-expanded={isOpen} aria-controls={model.listboxId} aria-activedescendant={activeDescendant} aria-autocomplete="list" aria-describedby={describedBy} onFocus={() => setIsOpen(true)} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleInputKeyDown} className="w-full rounded-2xl border px-4 py-3 pr-16 outline-none transition" style={{ borderColor: state.previewState === "focus" ? state.accent : state.border, background: "rgba(255,255,255,.06)", color: state.foreground }} />
            {state.keyboardShortcut && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border px-2 py-1 text-xs" style={{ borderColor: state.border, color: state.muted }}>
                {state.keyboardShortcut}
              </kbd>
            )}
          </div>
        </label>

        <p id={model.helperId} className="text-xs" style={{ color: state.muted }}>{state.helper} - {isSearching ? "Searching..." : model.resultLabel}</p>
        {model.isError && <p id={model.errorId} role="alert" className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: state.border, color: state.accent }}>{model.errorMessage}</p>}

        {isOpen && (
          <div id={model.listboxId} role="listbox" aria-label={model.inputLabel} className="grid gap-3 rounded-3xl border p-3" style={{ borderColor: state.border, background: "rgba(2,6,23,.18)", transition: state.transitionDuration > 0 ? "opacity 0.2s ease" : "none" }}>
            {model.isLoading && <div role="status" className="rounded-2xl px-4 py-3 text-sm" style={{ color: state.muted }}>{model.loadingMessage}</div>}
            {!model.isLoading && model.isEmpty && <div role="status" className="rounded-2xl px-4 py-3 text-sm" style={{ color: state.muted }}>{model.emptyMessage}</div>}
            {!model.isLoading && !model.isEmpty && model.groups.map((group) => (
              <div key={group.id} role="group" aria-label={group.label} className="grid gap-2">
                <p className="px-2 text-xs uppercase tracking-[0.18em]" style={{ color: state.muted }}>{group.label}</p>
                {group.options.map((option) => {
                  const selected = option.index === resolvedActiveIndex;

                  return (
                    <div key={option.id} id={option.id} role="option" aria-selected={selected} onMouseDown={(event) => event.preventDefault()} onMouseMove={() => setActiveIndex(option.index)} onClick={() => executeOption(option.index)} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: selected ? state.accent : "transparent", background: selected ? state.itemActiveBg : "transparent", color: selected ? state.itemActiveText : undefined, transition: state.transitionDuration > 0 ? "background 0.15s ease, border-color 0.15s ease" : "none" }}>
                      <span>
                        <strong>{option.label}</strong>
                        <small className="block" style={{ color: selected ? state.itemActiveText : state.muted }}>{option.helper}</small>
                      </span>
                      {state.showShortcuts && <kbd className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: state.border, color: selected ? state.itemActiveText : state.muted }}>{option.shortcut}</kbd>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        <p className="sr-only" aria-live="polite">{announcement}</p>
      </section>
    </div>
  );
}
