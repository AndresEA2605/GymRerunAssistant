import re

file_path = "c:/Users/Dreasy.AndresPC/Documents/GymRerunApp/src/components/GymRerunAssistant.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Chunk 1: Remove state
content = content.replace(
    "  const [focusStepMode, setFocusStepMode] = useState<boolean>(false);\n",
    ""
)

# Chunk 2: Enhance Active Session Card
old_card = """          {selectedGuideId !== 'none' && (currentStepIndex >= 0 ? (
            <div className="reveal-4 w-full space-y-2">
              <div className="w-full bg-amber-950/20 border border-amber-700/40 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-700/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black fs-small text-amber-300">Sesión activa</p>
                  <p className="fs-tiny text-amber-200/70 mt-0.5">Hay una ruta en progreso en el paso {currentStepIndex + 1}/{steps.length}.</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <Button variant="primary" size="md" onClick={() => exitMenu()} className="min-w-[140px]">
                      Continuar
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => setPendingResetAction("route")} className="min-w-[140px]">
                      Empezar de cero
                    </Button>
                  </div>
                </div>
              </div>
            </div>"""

new_card = """          {selectedGuideId !== 'none' && (currentStepIndex >= 0 ? (
            <div className="reveal-4 w-full">
              <div className="w-full bg-amber-900/20 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-5 shadow-xl shadow-amber-900/20 flex flex-col gap-4 relative overflow-hidden text-left">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner">
                    <Info className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-black fs-h3 text-amber-300 leading-tight">Sesión activa</h3>
                    <p className="fs-small text-amber-200/70 mt-1">
                      Hay una ruta en progreso en el paso <span className="font-bold text-white">{currentStepIndex + 1}</span> de {steps.length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 mt-2">
                  <Button variant="primary" size="lg" onClick={() => exitMenu()} className="w-full bg-amber-600 hover:bg-amber-500 border-amber-500/50 shadow-lg shadow-amber-900/40 text-sm font-black justify-center gap-2">
                    <Play className="w-4 h-4 fill-current" /> Continuar ruta
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => setPendingResetAction("route")} className="w-full bg-neutral-950 hover:bg-neutral-900 text-sm font-black justify-center">
                    Empezar de cero
                  </Button>
                </div>
              </div>
            </div>"""
content = content.replace(old_card, new_card)

# Chunk 3: Remove sidebar focus button
sidebar_btn = """            {currentStepIndex !== -1 && (
              <button onClick={() => setFocusStepMode((prev) => !prev)} className="w-full rounded-2xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-600 transition">
                {focusStepMode ? "Cerrar foco" : "Modo foco"}
              </button>
            )}"""
content = content.replace(sidebar_btn, "")
content = content.replace(sidebar_btn + "\n", "")

# Chunk 4: Modify main wrapper
main_old = '<main className={`flex-1 flex flex-col h-full relative z-10 ${focusStepMode ? "overflow-hidden" : "overflow-y-auto"} overflow-x-hidden ${currentStepIndex === -1 ? "pb-0" : selectedGuideId === "hooh" ? "pb-[calc(var(--footer-hooh-height)+1.5rem)]" : "pb-[calc(var(--footer-routes-height)+2rem)]"} lg:pl-[280px] `}>'
main_new = '<main className={`flex-1 flex flex-col h-full relative z-10 overflow-y-auto overflow-x-hidden ${currentStepIndex === -1 ? "pb-0" : selectedGuideId === "hooh" ? "pb-[calc(var(--footer-hooh-height)+1.5rem)]" : "pb-[calc(var(--footer-routes-height)+2rem)]"} lg:pl-[280px] `}>'
content = content.replace(main_old, main_new)

# Chunk 5: Remove header focus button
header_btn = """            {currentStepIndex !== -1 && (
              <Button
                variant={focusStepMode ? "success" : "secondary"}
                size="sm"
                onClick={() => setFocusStepMode((prev) => !prev)}
                className="px-3"
              >
                {focusStepMode ? "Cerrar foco" : "Modo foco"}
              </Button>
            )}"""
content = content.replace(header_btn, "")
content = content.replace(header_btn + "\n", "")

# Chunk 6: Modify main card wrapper
card_old = "<div key={slideKey} className={`w-full ${focusStepMode ? 'h-full max-w-full rounded-none' : 'max-w-6xl'} bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 p-2 md:p-5 lg:p-8 shadow-2xl relative text-center smooth-transition ${slideClass} scroll-mb-[var(--footer-routes-height)] ${focusStepMode ? 'fixed inset-0 z-40 overflow-y-auto overflow-x-hidden' : 'max-h-[calc(100dvh-14rem)] overflow-y-auto overflow-x-hidden'}`}>"
card_new = "<div key={slideKey} className={`w-full max-w-6xl bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 p-2 md:p-5 lg:p-8 shadow-2xl relative text-center smooth-transition ${slideClass} scroll-mb-[var(--footer-routes-height)] max-h-[calc(100dvh-14rem)] overflow-y-auto overflow-x-hidden`}>"
content = content.replace(card_old, card_new)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactoring complete.")
