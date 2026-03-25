"use client";

import SimulateIncident from "@/components/SimulateIncident";

interface Props {
  isPro: boolean;
}

export default function SimulateIncidentWrapper({ isPro }: Props) {
  return <SimulateIncident isPro={isPro} />;
}
