 "use client";
 
 import * as React from "react";
 import Script from "next/script";
 import { useParams, useRouter } from "next/navigation";
 import { simulations } from "@/data/simulations";
 
 export default function SimulationPlayPage() {
   const params = useParams();
   const router = useRouter();
   const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
   const simulation = simulations.find((item) => item.id === id);
 
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [scriptFailed, setScriptFailed] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);
  const [isModuleReady, setIsModuleReady] = React.useState(false);
   const [isRuntimeReady, setIsRuntimeReady] = React.useState(false);
   const [isFullscreen, setIsFullscreen] = React.useState(false);
   const [isPageVisible, setIsPageVisible] = React.useState(true);
 
   const containerRef = React.useRef<HTMLDivElement | null>(null);
   const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
 
   const playable = simulation?.playable;
   const basePath = playable?.scriptSrc.replace(/\/[^/]+$/, "") ?? "";
 
  React.useEffect(() => {
    const handler = () => {
      const nowFullscreen = document.fullscreenElement === containerRef.current;
      setIsFullscreen(nowFullscreen);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
 
   React.useEffect(() => {
     const update = () => setIsPageVisible(!document.hidden);
     update();
     document.addEventListener("visibilitychange", update);
     window.addEventListener("focus", update);
     window.addEventListener("blur", update);
     return () => {
       document.removeEventListener("visibilitychange", update);
       window.removeEventListener("focus", update);
       window.removeEventListener("blur", update);
     };
   }, []);
 
   const ensureModule = React.useCallback(() => {
     if (!playable) return;
     const canvas =
       canvasRef.current ??
       (document.getElementById(playable.canvasId) as HTMLCanvasElement | null);
     if (!canvas) return;
 
    const existingModule = (window as { Module?: any }).Module;
    const moduleRef = existingModule ?? {};
    if (moduleRef.canvas !== canvas) {
      moduleRef.canvas = canvas;
    }
    if (!moduleRef.locateFile) {
      moduleRef.locateFile = (path: string) => `${basePath}/${path}`;
    }
    if (moduleRef.calledRun) {
       setIsRuntimeReady(true);
      setIsModuleReady(true);
       return;
     }
 
    const nextModule =
      moduleRef.canvas === canvas
        ? moduleRef
        : {
            canvas,
            locateFile: (path: string) => `${basePath}/${path}`,
          };
 
     const previousInit = nextModule.onRuntimeInitialized;
     nextModule.onRuntimeInitialized = () => {
       if (typeof previousInit === "function") previousInit();
       setIsRuntimeReady(true);
      setIsModuleReady(true);
     };
 
    (window as { Module?: any }).Module = nextModule;
    setIsModuleReady(true);
   }, [playable, basePath]);
 
  React.useEffect(() => {
    if (!hasStarted || !playable) return;
    ensureModule();
  }, [hasStarted, playable, ensureModule]);
 
   React.useEffect(() => {
    if (!hasStarted || !scriptLoaded || !isRuntimeReady) return;
     const moduleRef = (window as { Module?: any }).Module as
       | { pauseMainLoop?: () => void; resumeMainLoop?: () => void }
       | undefined;
     const pauseMainLoop = moduleRef?.pauseMainLoop?.bind(moduleRef);
     const resumeMainLoop = moduleRef?.resumeMainLoop?.bind(moduleRef);
     if (!pauseMainLoop || !resumeMainLoop) return;
 
     const shouldRun = isFullscreen && isPageVisible;
     try {
       if (shouldRun) resumeMainLoop();
       else pauseMainLoop();
     } catch {
       // Ignore runtime timing edge cases.
     }
 
     return () => {
       try {
         pauseMainLoop();
       } catch {
         // Ignore runtime timing edge cases.
       }
     };
  }, [hasStarted, scriptLoaded, isRuntimeReady, isFullscreen, isPageVisible]);
 
  const handleStart = async () => {
    if (!playable) return;
    if (!hasStarted) {
      setScriptFailed(false);
      setScriptLoaded(false);
      setIsModuleReady(false);
      ensureModule();
      setHasStarted(true);
    }
    if (containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
      } catch {
        // If fullscreen fails, keep running in-page.
      }
    }
  };
 
   if (!simulation || !playable) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-black text-white">
         <div className="text-center text-sm">
           Simulasyon bulunamadi.
           <button
             type="button"
             onClick={() => router.back()}
             className="ml-3 rounded-full border border-white/30 px-3 py-1 text-xs"
           >
             Geri don
           </button>
         </div>
       </div>
     );
   }
 
   return (
     <div
       ref={containerRef}
       className="flex min-h-screen flex-col items-center justify-center bg-black text-white"
     >
       <div className="absolute left-6 top-6 z-10 flex items-center gap-3 text-xs text-white/80">
         <button
           type="button"
           onClick={() => router.back()}
           className="rounded-full border border-white/30 px-3 py-1"
         >
           Geri
         </button>
         <div>{simulation.title}</div>
       </div>
 
      {hasStarted ? (
         <>
           <canvas
             id={playable.canvasId}
             ref={canvasRef}
             width={playable.width ?? 960}
             height={playable.height ?? 540}
             className="h-full w-full bg-black"
           />
          {isModuleReady ? (
            <Script
              id={`script-${simulation.id}`}
              src={playable.scriptSrc}
              strategy="afterInteractive"
              onLoad={() => setScriptLoaded(true)}
              onError={() => setScriptFailed(true)}
            />
          ) : null}
         </>
       ) : (
         <div className="flex flex-col items-center gap-4 text-center">
           <div className="text-sm text-white/80">
             Oyun yeni sekmede acildi. Baslatmak icin asagiya tikla.
           </div>
           <button
             type="button"
             onClick={handleStart}
             className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
           >
             Oyunu baslat
           </button>
         </div>
       )}
 
      {hasStarted && !scriptLoaded && !scriptFailed ? (
         <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
           Yukleniyor...
         </div>
       ) : null}
      {hasStarted && !isFullscreen ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 text-xs text-white">
          <div>Tam ekranda devam et</div>
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black"
          >
            Tekrar baslat
          </button>
        </div>
      ) : null}
       {scriptFailed ? (
         <div className="absolute inset-0 flex items-center justify-center bg-black text-xs text-white">
           Playable build bulunamadi.
         </div>
       ) : null}
     </div>
   );
 }
