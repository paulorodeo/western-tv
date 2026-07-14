import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const STREAM_URL = "/api/public/hls/live.m3u8";

export function LivePlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "error" | "paused">("loading");
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;

    const onPlaying = () => setStatus("playing");
    const onWaiting = () => setStatus("loading");
    const onPause = () => setStatus("paused");
    const onError = () => setStatus("error");

    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);

    if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true, backBufferLength: 30 });
      hls.loadSource(STREAM_URL);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setStatus("error");
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = STREAM_URL;
    } else {
      setStatus("error");
    }

    const play = () => video.play().catch(() => {});
    video.muted = true;
    play();

    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);

    return () => {
      hls?.destroy();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  const toggleFullscreen = () => {
    const el = containerRef.current; if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const retry = () => {
    setStatus("loading");
    videoRef.current?.load();
    videoRef.current?.play().catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="h-full w-full object-cover"
      />

      {/* Loading / status overlay */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-black/90 to-black">
          <div className="absolute inset-x-0 top-1/2 h-px shimmer" />
          <p className="eyebrow">Preparando transmissão</p>
          <p className="mt-3 font-display text-2xl text-foreground/90">Ajuste sua antena…</p>
          <p className="mt-2 text-xs text-muted-foreground">Aguarde alguns instantes enquanto o sinal chega ao rancho.</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 px-6 text-center">
          <p className="eyebrow">Sinal indisponível</p>
          <p className="mt-3 font-display text-2xl text-foreground">A transmissão está fora do ar</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Nosso sinal está momentaneamente indisponível. Tente novamente em instantes.</p>
          <button onClick={retry} className="mt-6 rounded-sm bg-gold px-5 py-2.5 text-[11px] tracking-[0.28em] uppercase text-primary-foreground hover:opacity-90">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4 sm:p-5">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">
          <span className={`h-2 w-2 rounded-full bg-red-500 ${status === "playing" ? "animate-live" : ""}`} />
          <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-white">
            {status === "playing" ? "Ao vivo" : status === "loading" ? "Sintonizando" : "Offline"}
          </span>
        </div>
        <div className="pointer-events-auto text-[10px] tracking-[0.28em] uppercase text-white/60">
          Fazenda Rodeo TV · HD
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100 sm:p-5">
        <button
          onClick={toggleMute}
          aria-label={muted ? "Ativar som" : "Silenciar"}
          className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/20"
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          )}
        </button>
        <button
          onClick={toggleFullscreen}
          aria-label="Tela cheia"
          className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/20"
        >
          {isFullscreen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V3h4"/><path d="M21 7V3h-4"/><path d="M3 17v4h4"/><path d="M21 17v4h-4"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
