"use client";

import SimulateIncident from "@/components/SimulateIncident";

interface Props {
  isPro: boolean;
  onDemoComplete?: () => void;
}

export default function SimulateIncidentWrapper({ isPro, onDemoComplete }: Props) {
  return <SimulateIncident isPro={isPro} onDemoComplete={onDemoComplete} />;
}
