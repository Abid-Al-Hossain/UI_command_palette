import type { CommandPaletteState } from "../types";

export type CommandOption = {
  id: string;
  index: number;
  label: string;
  helper: string;
  shortcut: string;
};

export type CommandGroup = {
  id: string;
  label: string;
  options: CommandOption[];
};

export type CommandPaletteModel = {
  baseId: string;
  labelId: string;
  inputId: string;
  listboxId: string;
  helperId: string;
  errorId: string;
  triggerId: string;
  inputLabel: string;
  placeholder: string;
  query: string;
  emptyMessage: string;
  loadingMessage: string;
  errorMessage: string;
  resultLabel: string;
  isInitiallyOpen: boolean;
  isLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  activeIndex: number;
  activeDescendant: string | undefined;
  totalOptions: number;
  groups: CommandGroup[];
};

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

function cleanId(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "command-palette";
}

function textValue(value: string | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}

export function getCommandPaletteModel(state: CommandPaletteState, queryOverride?: string): CommandPaletteModel {
  const id = cleanId(state.id);
  const rawTotal = state.emptyState || state.previewState === "empty" ? 0 : Math.max(0, Math.floor(state.itemCount));
  const sourceTotal = Math.min(rawTotal, Math.max(0, Math.floor(state.maxResults)) || rawTotal);
  const groupCount = state.groupsEnabled
    ? Math.max(1, Math.min(Math.floor(state.groupCount), Math.max(sourceTotal, 1)))
    : 1;
  const isLoading = state.previewState === "loading";
  const isError = state.previewState === "error";
  const isInitiallyOpen = state.previewState !== "closed";
  const label = textValue(state.label, "Command");
  const query = queryOverride ?? state.query ?? "";
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const groups = Array.from({ length: groupCount }, (_, groupIndex) => {
    const groupLabel = !state.groupsEnabled
      ? "All commands"
      : state.recentEnabled && groupIndex === 0
        ? "Recent"
        : GROUP_LABELS[groupIndex % GROUP_LABELS.length];
    const options = Array.from({ length: sourceTotal }, (_, index) => index)
      .filter((index) => index % groupCount === groupIndex)
      .map((index) => ({
        id: `${id}-option-${index}`,
        index,
        label: `${label} ${index + 1}`,
        helper: COMMAND_HELPERS[index % COMMAND_HELPERS.length],
        shortcut: SHORTCUTS[index % SHORTCUTS.length],
      }))
      .filter((option) => !normalizedQuery || [option.label, option.helper, option.shortcut, groupLabel].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)));

    return {
      id: `${id}-group-${groupIndex}`,
      label: groupLabel,
      options,
    };
  }).filter((group) => group.options.length > 0);
  const visibleOptions = groups.flatMap((group) => group.options);
  const totalOptions = visibleOptions.length;
  const preferredIndex = Math.max(0, Math.min(Math.floor(state.highlightedIndex), Math.max(sourceTotal - 1, 0)));
  const activeIndex = totalOptions
    ? (visibleOptions.some((option) => option.index === preferredIndex) ? preferredIndex : visibleOptions[0].index)
    : -1;
  const isEmpty = totalOptions === 0;

  return {
    baseId: id,
    labelId: `${id}-label`,
    inputId: `${id}-input`,
    listboxId: `${id}-listbox`,
    helperId: `${id}-helper`,
    errorId: `${id}-error`,
    triggerId: `${id}-trigger`,
    inputLabel: textValue(state.inputLabel, "Search commands"),
    placeholder: textValue(state.placeholder, "Type a command or search route..."),
    query,
    emptyMessage: textValue(state.emptyMessage, "No commands match the current search."),
    loadingMessage: textValue(state.loadingMessage, "Loading command results..."),
    errorMessage: textValue(state.errorMessage, "Commands could not be loaded."),
    resultLabel: textValue(state.resultLabel, `${totalOptions} command${totalOptions === 1 ? "" : "s"} available`),
    isInitiallyOpen,
    isLoading,
    isEmpty,
    isError,
    activeIndex,
    activeDescendant: isInitiallyOpen && !isLoading && !isError && !isEmpty ? `${id}-option-${activeIndex}` : undefined,
    totalOptions,
    groups,
  };
}
