import type { CommandPaletteState } from "../types";

export type ExportPayload = { fileName: string; mimeType: "text/plain;charset=utf-8"; content: string };

export function buildExportPayload(state: CommandPaletteState, fileName = "command-palette"): ExportPayload {
  return { fileName: `${fileName || "command-palette"}.jsx`, mimeType: "text/plain;charset=utf-8", content: buildReactCode(state) };
}

export function buildReactCode(state: CommandPaletteState) {
  const serializedState = JSON.stringify(state, null, 2);

  return `import * as React from "react";

const state = ${serializedState};

const GROUP_LABELS = ["Navigation", "Actions", "Records", "Settings", "Support", "Recent", "Admin", "Shortcuts"];
const COMMAND_HELPERS = [
  "Open matching workspace",
  "Run primary action",
  "Jump to recent result",
  "Create a filtered view",
  "Review team workflow",
  "Pin this command",
  "Open detail panel",
  "Copy command link",
];
const SHORTCUTS = ["Ctrl+K", "G D", "Shift+Ctrl+P", "Ctrl+Enter", "Ctrl+1", "Ctrl+2", "Ctrl+3", "Esc"];

function cleanId(value) {
  return value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "command-palette";
}

function textValue(value, fallback) {
  return value && value.trim() ? value : fallback;
}

function getCommandPaletteModel(currentState) {
  const id = cleanId(currentState.id);
  const totalOptions = currentState.emptyState || currentState.previewState === "empty" ? 0 : Math.max(0, Math.floor(currentState.itemCount));
  const groupCount = Math.max(1, Math.min(Math.floor(currentState.groupCount), Math.max(totalOptions, 1)));
  const activeIndex = totalOptions ? Math.max(0, Math.min(Math.floor(currentState.highlightedIndex), totalOptions - 1)) : -1;
  const isLoading = currentState.previewState === "loading";
  const isError = currentState.previewState === "error";
  const isEmpty = totalOptions === 0;
  const isInitiallyOpen = currentState.previewState !== "closed";
  const label = textValue(currentState.label, "Command");
  const groups = Array.from({ length: groupCount }, (_, groupIndex) => {
    const options = Array.from({ length: totalOptions }, (_, index) => index)
      .filter((index) => index % groupCount === groupIndex)
      .map((index) => ({
        id: id + "-option-" + index,
        label: label + " " + (index + 1),
        helper: COMMAND_HELPERS[index % COMMAND_HELPERS.length],
        shortcut: SHORTCUTS[index % SHORTCUTS.length],
      }));

    return {
      id: id + "-group-" + groupIndex,
      label: GROUP_LABELS[groupIndex % GROUP_LABELS.length],
      options,
    };
  }).filter((group) => group.options.length > 0);

  return {
    baseId: id,
    labelId: id + "-label",
    inputId: id + "-input",
    listboxId: id + "-listbox",
    helperId: id + "-helper",
    errorId: id + "-error",
    triggerId: id + "-trigger",
    inputLabel: textValue(currentState.inputLabel, "Search commands"),
    placeholder: textValue(currentState.placeholder, "Type a command or search route..."),
    query: currentState.query ?? "",
    emptyMessage: textValue(currentState.emptyMessage, "No commands match the current search."),
    loadingMessage: textValue(currentState.loadingMessage, "Loading command results..."),
    errorMessage: textValue(currentState.errorMessage, "Commands could not be loaded."),
    resultLabel: textValue(currentState.resultLabel, totalOptions + " command" + (totalOptions === 1 ? "" : "s") + " available"),
    isInitiallyOpen,
    isLoading,
    isEmpty,
    isError,
    activeIndex,
    totalOptions,
    groups,
  };
}

function getShellStyle(currentState) {
  return {
    width: currentState.width,
    minHeight: currentState.height,
    padding: currentState.padding,
    gap: currentState.gap,
    borderRadius: currentState.radius,
    border: currentState.borderWidth + "px solid " + currentState.border,
    boxShadow: "0 " + Math.round(currentState.shadow / 3) + "px " + currentState.shadow + "px rgba(0,0,0,.28)",
    background: currentState.background,
    color: currentState.foreground,
    fontFamily: currentState.fontFamily,
    opacity: currentState.disabled ? 0.55 : 1,
    display: "grid",
  };
}

export default function CommandPaletteComponent() {
  const model = getCommandPaletteModel(state);
  const [isOpen, setIsOpen] = React.useState(model.isInitiallyOpen);
  const [activeIndex, setActiveIndex] = React.useState(model.activeIndex);
  const [query, setQuery] = React.useState(model.query);
  const activeDescendant = isOpen && activeIndex >= 0 ? model.baseId + "-option-" + activeIndex : undefined;
  const describedBy = model.isError ? model.helperId + " " + model.errorId : model.helperId;

  const moveActive = (delta) => {
    if (!model.totalOptions) return;
    setActiveIndex((current) => (current + delta + model.totalOptions) % model.totalOptions);
  };

  const handleInputKeyDown = (event) => {
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
    <div style={{ display: "grid", placeItems: "center" }}>
      <section id={state.id} role="dialog" aria-modal="false" aria-labelledby={model.labelId} aria-describedby={describedBy} style={getShellStyle(state)}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h3 id={model.labelId} style={{ margin: 0, fontSize: state.titleSize, fontWeight: state.fontWeight }}>{state.title}</h3>
            <p style={{ margin: "4px 0 0", color: state.muted, fontSize: state.bodySize }}>{state.description}</p>
          </div>
          <button id={model.triggerId} type="button" disabled={state.disabled} aria-label={isOpen ? "Close command palette" : "Open command palette"} aria-expanded={isOpen} aria-controls={model.listboxId} onClick={() => setIsOpen((value) => !value)} style={{ borderRadius: 999, border: "1px solid " + state.border, padding: "4px 12px", color: state.accent, background: "transparent", fontSize: 12, fontWeight: 700, transition: state.motion ? "background 0.15s ease, border-color 0.15s ease" : "none" }}>
            {isOpen ? "Open" : "Closed"}
          </button>
        </div>

        <label htmlFor={model.inputId} style={{ display: "grid", gap: 8, fontSize: 14, fontWeight: 700 }}>
          <span>{model.inputLabel}</span>
          <input id={model.inputId} role="combobox" type="search" disabled={state.disabled} value={query} placeholder={model.placeholder} aria-expanded={isOpen} aria-controls={model.listboxId} aria-activedescendant={activeDescendant} aria-autocomplete="list" aria-describedby={describedBy} onFocus={() => setIsOpen(true)} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleInputKeyDown} style={{ borderRadius: 18, border: "1px solid " + (state.previewState === "focus" ? state.accent : state.border), padding: "12px 16px", outline: "none", background: "rgba(255,255,255,.06)", color: state.foreground }} />
        </label>

        <p id={model.helperId} style={{ margin: 0, color: state.muted, fontSize: 12 }}>{state.helper} - {model.resultLabel}</p>
        {model.isError && <p id={model.errorId} role="alert" style={{ margin: 0, border: "1px solid " + state.border, borderRadius: 18, padding: "12px 16px", color: state.accent }}>{model.errorMessage}</p>}

        {isOpen && (
          <div id={model.listboxId} role="listbox" aria-label={model.inputLabel} style={{ display: "grid", gap: 12, border: "1px solid " + state.border, borderRadius: 24, padding: 12, background: "rgba(2,6,23,.18)", transition: state.motion ? "opacity 0.2s ease" : "none" }}>
            {model.isLoading && <div role="status" style={{ borderRadius: 18, padding: "12px 16px", color: state.muted }}>{model.loadingMessage}</div>}
            {!model.isLoading && model.isEmpty && <div role="status" style={{ borderRadius: 18, padding: "12px 16px", color: state.muted }}>{model.emptyMessage}</div>}
            {!model.isLoading && !model.isEmpty && model.groups.map((group) => (
              <div key={group.id} role="group" aria-label={group.label} style={{ display: "grid", gap: 8 }}>
                <p style={{ margin: 0, paddingInline: 8, color: state.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: ".18em" }}>{group.label}</p>
                {group.options.map((option) => {
                  const optionIndex = Number(option.id.split("-").at(-1));
                  const selected = optionIndex === activeIndex || state.previewState === "selected";

                  return (
                    <div key={option.id} id={option.id} role="option" aria-selected={selected} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid " + (selected ? state.accent : "transparent"), borderRadius: 18, padding: "12px 16px", background: selected ? "rgba(255,255,255,.1)" : "transparent", transition: state.motion ? "background 0.15s ease, border-color 0.15s ease" : "none" }}>
                      <span>
                        <strong>{option.label}</strong>
                        <small style={{ display: "block", color: state.muted }}>{option.helper}</small>
                      </span>
                      {state.showShortcuts && <kbd style={{ border: "1px solid " + state.border, borderRadius: 8, padding: "4px 8px", color: state.muted, fontSize: 12 }}>{option.shortcut}</kbd>}
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
`;
}
