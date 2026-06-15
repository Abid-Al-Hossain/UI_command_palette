"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Select from "@/components/shared/input/Select";
import Switch from "@/components/shared/input/Switch";
import type { CommandPaletteState } from "../types";

type Props = { state: CommandPaletteState; update: <K extends keyof CommandPaletteState>(key: K, value: CommandPaletteState[K]) => void };

export default function BehaviorSection({ state, update }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Open Mode" subtitle="How the command palette opens and closes.">
        <Select label="Open mode" value={state.openMode} options={["single", "multiple", "manual", "controlled", "uncontrolled"]} onChange={(value) => update("openMode", value)} />
      </SectionCard>
      <SectionCard title="Display" subtitle="Command item display options.">
        <Switch label="Show shortcuts" checked={state.showShortcuts} onChange={(value) => update("showShortcuts", value)} />
        <Switch label="Disabled" checked={state.disabled} onChange={(value) => update("disabled", value)} />
      </SectionCard>
    </div>
  );
}
