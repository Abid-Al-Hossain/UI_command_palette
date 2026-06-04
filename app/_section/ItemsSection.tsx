"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Slider from "@/components/shared/input/Slider";
import type { CommandPaletteState } from "../types";

type Props = { state: CommandPaletteState; update: <K extends keyof CommandPaletteState>(key: K, value: CommandPaletteState[K]) => void };

export default function ItemsSection({ state, update }: Props) {
  return <SectionCard title="Items" subtitle="Items controls for native command generation."><Slider label="Item count" value={state.itemCount} min={1} max={14} step={1} onChange={(value) => update("itemCount", value)} />
<Slider label="Groups" value={state.groupCount} min={1} max={8} step={1} onChange={(value) => update("groupCount", value)} /></SectionCard>;
}
