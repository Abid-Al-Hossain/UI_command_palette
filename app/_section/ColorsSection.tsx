"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import ColorControl from "@/components/shared/color/ColorControl";
import type { CommandPaletteState } from "../types";

type Props = { state: CommandPaletteState; update: <K extends keyof CommandPaletteState>(key: K, value: CommandPaletteState[K]) => void };

export default function ColorsSection({ state, update }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Colors" subtitle="Colors controls for native command generation.">
        <ColorControl label="Accent" value={state.accent} onChange={(value) => update("accent", value)} />
        <ColorControl label="Background" value={state.background} onChange={(value) => update("background", value)} />
        <ColorControl label="Foreground" value={state.foreground} onChange={(value) => update("foreground", value)} />
        <ColorControl label="Muted text" value={state.muted} onChange={(value) => update("muted", value)} />
      </SectionCard>
      <SectionCard title="Active Item" subtitle="Highlighted/selected command item colors.">
        <ColorControl label="Active background" value={state.itemActiveBg} onChange={(value) => update("itemActiveBg", value)} />
        <ColorControl label="Active text" value={state.itemActiveText} onChange={(value) => update("itemActiveText", value)} />
      </SectionCard>
    </div>
  );
}
