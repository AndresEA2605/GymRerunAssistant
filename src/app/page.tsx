import GymRerunAssistant from "@/components/GymRerunAssistant";
import rawSteps from "@/data/route.json";
import { GYM_COORDS, REGION_MAP } from "@/data/gymCoords";
import { RouteStep } from "@/types";

const steps = rawSteps as RouteStep[];

export default function Home() {
  return (
    <GymRerunAssistant
      steps={steps}
      gymCoords={GYM_COORDS}
      regionMap={REGION_MAP}
      config={{
        totalGyms: 33,
        title: "GYM RERUN",
        subtitle: "ASSISTANT",
        description: "Guía secuencial para 33 Gym Reruns en PokeMMO",
      }}
    />
  );
}
