"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Slider from "@/components/shared/input/Slider";
import Switch from "@/components/shared/input/Switch";
import type { CommandPaletteState } from "../types";

type Props = { state: CommandPaletteState; update: <K extends keyof CommandPaletteState>(key: K, value: CommandPaletteState[K]) => void };

export default function ItemsSection({ state, update }: Props) {
  return (
    <SectionCard title="Items" subtitle="Items controls for native command generation.">
      <Slider label="Item count" value={state.itemCount} min={1} max={14} step={1} onChange={(value) => update("itemCount", value)} />
      <Slider label="Max results" value={state.maxResults} min={1} max={20} step={1} onChange={(value) => update("maxResults", value)} />
      <Switch label="Group results" checked={state.groupsEnabled} onChange={(value) => update("groupsEnabled", value)} />
      {state.groupsEnabled && (
        <>
          <Slider label="Groups" value={state.groupCount} min={1} max={8} step={1} onChange={(value) => update("groupCount", value)} />
          <Switch label="Show 'Recent' group first" checked={state.recentEnabled} onChange={(value) => update("recentEnabled", value)} />
        </>
      )}
    </SectionCard>
  );
}
