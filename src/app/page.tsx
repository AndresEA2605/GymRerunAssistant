import GymRerunAssistant from "@/components/GymRerunAssistant";
import ErrorBoundary from "@/components/ErrorBoundary";
import rawSteps from "@/data/route.json";
import { GYM_COORDS, REGION_MAP } from "@/data/gymCoords";
import { RouteStep } from "@/types";

const steps = rawSteps as RouteStep[];

export default function Home() {
  if (!steps || steps.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center fs-body p-8 text-center">
        No hay datos de ruta disponibles. Verifica que route.json esté presente.
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
