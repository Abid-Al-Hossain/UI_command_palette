"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Input from "@/components/shared/input/Input";
import type { CommandPaletteState } from "../types";

type Props = { state: CommandPaletteState; update: <K extends keyof CommandPaletteState>(key: K, value: CommandPaletteState[K]) => void };

export default function AccessibilitySection({ state, update }: Props) {
  return <SectionCard title="Accessibility" subtitle="Accessibility controls for native command generation."><Input label="Accessible label" value={state.ariaLabel} onChange={(value) => update("ariaLabel", value)} />
<Input label="Empty state" value={state.emptyMessage ?? ""} onChange={(value) => update("emptyMessage", value)} />
<Input label="Loading state" value={state.loadingMessage ?? ""} onChange={(value) => update("loadingMessage", value)} />
<Input label="Error state" value={state.errorMessage ?? ""} onChange={(value) => update("errorMessage", value)} />
<Input label="Result count label" value={state.resultLabel ?? ""} onChange={(value) => update("resultLabel", value)} /></SectionCard>;
}
