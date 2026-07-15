import { useEffect, useRef, useState } from "react";

const STREAM_URL = "/api/public/radio/live.m3u8";

type Status = "off" | "loading" | "live" | "error";

export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<Status>("off");
  const [playing, setPlaying] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<string>("Fazenda Rodeo Country Rádio");
  const [volume, setVolume] = useState(0.8);
  const hlsRef = useRef<any>(null);

  // Poll ICY / metadata via the HLS PROGRAM-DATE-TIME / ID3 (best effort)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const handler = (e: any) => {
      try {
        const cues = e?.target?.track?.activeCues;
        if (cues && cues.length) {
          const txt = Array.from(cues).map((c: any) => c.value?.data || c.text || "").join(" ");
          if (txt) setNowPlaying(txt);
        }
      } catch {}
    };
    a.addEventListener("timeupdate", () => {});
    return () => {
      a.removeEventListener("timeupdate", handler);
    };
  }, []);

  const attach = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setStatus("loading");
    try {
      const HlsMod = (await import("hls.js")).default;
      if (HlsMod.isSupported()) {
        const hls = new HlsMod({ lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(STREAM_URL);
        hls.attachMedia(audio);
        hls.on(HlsMod.Events.ERROR, (_: unknown, data: any) => {
          if (data.fatal) setStatus("error");
        });
        hls.on(HlsMod.Events.FRAG_PARSING_METADATA, (_: unknown, data: any) => {
          try {
            const samples = data?.samples || [];
            for (const s of samples) {
              const raw = new TextDecoder("utf-8", { fatal: false }).decode(s.data || new Uint8Array());
              const match = raw.match(/[\x20-\x7EÀ-ÿ]{4,}/g);
              if (match && match.length) {
                const candidate = match.sort((a: string, b: string) => b.length - a.length)[0];
                if (candidate) setNowPlaying(candidate.trim());
                break;
              }
            }
          } catch {}
        });
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = STREAM_URL;
      } else {
        setStatus("error");
        return;
      }
      audio.volume = volume;
      await audio.play();
      setPlaying(true);
      setStatus("live");
    } catch {
      setStatus("error");
    }
  };

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (!hlsRef.current && !a.src) {
      await attach();
      return;
    }
    if (a.paused) {
      try { await a.play(); setPlaying(true); setStatus("live"); } catch { setStatus("error"); }
    } else {
      a.pause();
      setPlaying(false);
      setStatus("off");
    }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy?.();
    };
  }, []);

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-4 py-2.5 text-[10px] tracking-[0.28em] uppercase text-white/80 backdrop-blur-xl transition hover:text-gold"
        aria-label="Abrir rádio"
      >
        <span className="h-2 w-2 rounded-full bg-white/40" />
        Rádio
      </button>
    );
  }

  const dot =
    status === "live"
      ? "bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)] animate-live"
      : status === "loading"
      ? "bg-amber-300"
      : status === "error"
      ? "bg-red-500"
      : "bg-white/30";

  const statusLabel =
    status === "live" ? "Ao vivo" : status === "loading" ? "Conectando" : status === "error" ? "Offline" : "Desligado";

  return (
    <div
      className={`fixed z-[60] transition-all duration-300 ${
        minimized
          ? "bottom-5 right-5 w-auto"
          : "bottom-5 right-5 w-[min(340px,calc(100vw-2.5rem))]"
      }`}
    >
      <audio ref={audioRef} preload="none" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/85 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {minimized ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pausar rádio" : "Tocar rádio"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-primary-foreground transition hover:opacity-90"
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <button
              onClick={() => setMinimized(false)}
              className="text-[10px] tracking-[0.28em] uppercase text-white/70 hover:text-gold"
            >
              Rádio
            </button>
            <button
              onClick={() => setHidden(true)}
              aria-label="Esconder rádio"
              className="ml-1 rounded-full p-1 text-white/50 hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="text-[9px] font-semibold tracking-[0.32em] uppercase text-white/80">
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(true)}
                  aria-label="Minimizar"
                  className="rounded-full p-1.5 text-white/50 transition hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/></svg>
                </button>
                <button
                  onClick={() => setHidden(true)}
                  aria-label="Fechar"
                  className="rounded-full p-1.5 text-white/50 transition hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={togglePlay}
                aria-label={playing ? "Pausar" : "Tocar"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(212,175,55,0.7)] transition hover:opacity-90 active:scale-95"
              >
                {playing ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="eyebrow !text-[9px]">Country Rádio</p>
                <p className="truncate text-sm text-foreground/90" title={nowPlaying}>
                  {nowPlaying}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volume"
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--gold)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
