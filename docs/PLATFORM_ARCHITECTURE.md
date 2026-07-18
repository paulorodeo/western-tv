# Arquitetura da Plataforma de Mídia

> Diagrama global da plataforma de mídia da Fazenda Rodeo — do browser ao storage.

---

## 1. Diagrama Mermaid

```mermaid
flowchart TB
    subgraph Client["🌐 Browser (Client)"]
        UI[UI Layer<br/>React Components]
        ME[Media Engine<br/>Core Abstraction]
        VE[Video Engine<br/>HTMLVideoElement]
        AE[Audio Engine<br/>HTMLAudioElement]
        MS[Media Session API]
        FP[Floating Player]
        PIP[Document<br/>Picture-in-Picture]
        HLS[HLS Adapter<br/>hls.js / Safari native]
    end

    subgraph Edge["⚡ Edge Layer (TanStack Start / Cloudflare Worker)"]
        PROXY[Proxy Layer<br/>/api/public/hls/*<br/>/api/public/radio/*]
        CACHE[HTTP Cache<br/>Cloudflare]
    end

    subgraph Origin["🎬 Origin Servers"]
        HLSORIG[HLS Origin<br/>tv.fazenda.rodeo<br/>live.fazenda.rodeo]
        STORAGE[(Storage<br/>Segments / Manifests)]
    end

    UI --> ME
    ME --> VE
    ME --> AE
    ME --> HLS
    ME --> MS
    ME --> FP
    FP --> PIP
    HLS -->|fetch m3u8 / .ts| PROXY
    VE -->|native fallback<br/>Safari| PROXY
    AE -->|fetch stream| PROXY
    PROXY -->|same-origin<br/>+ CORS + MIME fix| CACHE
    CACHE --> HLSORIG
    HLSORIG --> STORAGE

    classDef client fill:#1a1a2e,stroke:#d4af37,color:#fff
    classDef edge fill:#0f3460,stroke:#d4af37,color:#fff
    classDef origin fill:#16213e,stroke:#d4af37,color:#fff
    class UI,ME,VE,AE,MS,FP,PIP,HLS client
    class PROXY,CACHE edge
    class HLSORIG,STORAGE origin
```

## 2. Diagrama ASCII

```text
┌──────────────────────────── Browser (Client) ─────────────────────────────┐
│                                                                           │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                      UI Layer (React)                           │     │
│   │  TVSkin · RadioSkin · PodcastSkin · VODSkin · ClipSkin          │     │
│   └───────────────────────────────┬─────────────────────────────────┘     │
│                                   │                                       │
│   ┌───────────────────────────────▼─────────────────────────────────┐     │
│   │                    Media Engine (Core)                          │     │
│   │  Controller · FSM · Services (MediaSession, Fullscreen, PiP)    │     │
│   └───────┬────────────────┬────────────────┬─────────────────┬─────┘     │
│           │                │                │                 │           │
│    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐    │
│    │ Video Eng.  │  │ Audio Eng.  │  │ HLS Adapter │  │ Floating +   │    │
│    │ <video>     │  │ <audio>     │  │ hls.js /    │  │ Document PiP │    │
│    │             │  │             │  │ Safari nat. │  │              │    │
│    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────────┘    │
└───────────┼────────────────┼────────────────┼─────────────────────────────┘
            │                │                │
            │      HTTP (same-origin, CORS, Range)
            ▼                ▼                ▼
┌────────────────────── Edge Layer (Worker) ────────────────────────────────┐
│                                                                           │
│   ┌───────────────────────────────────────────────────────────────┐       │
│   │  Proxy Layer                                                  │       │
│   │  /api/public/hls/*   /api/public/radio/*                      │       │
│   │  • CORS  • MIME fix  • Range forward  • streaming             │       │
│   └───────────────────────────────┬───────────────────────────────┘       │
│                                   │                                       │
│   ┌───────────────────────────────▼───────────────────────────────┐       │
│   │  HTTP Cache (Cloudflare edge)                                 │       │
│   └───────────────────────────────┬───────────────────────────────┘       │
└───────────────────────────────────┼───────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────── Origin Servers ──────────────────────────────────┐
│                                                                           │
│   tv.fazenda.rodeo/hls/     live.fazenda.rodeo/hls/country/               │
│                                   │                                       │
│                                   ▼                                       │
│              ┌──────────────────────────────────┐                         │
│              │   Storage (segments + manifests) │                         │
│              └──────────────────────────────────┘                         │
└───────────────────────────────────────────────────────────────────────────┘
```

## 3. Responsabilidade de cada camada

| Camada | Responsabilidade | Contratos |
|---|---|---|
| **UI Layer** | Render, interação, skin por superfície | Props/hooks do Media Engine |
| **Media Engine** | Orquestração, FSM, ciclo de vida | `MediaController` (ver [`MEDIA_ENGINE.md`](./MEDIA_ENGINE.md)) |
| **Video/Audio Engine** | Wrapper de `HTMLMediaElement` | Eventos DOM padrão |
| **HLS Adapter** | `hls.js` × HLS nativo | `StreamAdapter` interface |
| **Media Session** | Metadata para SO/lockscreen | Media Session API |
| **Floating / PiP** | Container flutuante e Doc PiP | Componentes headless |
| **Proxy Layer** | CORS, MIME, Range, streaming | HTTP público (ver [`API_REFERENCE.md`](./API_REFERENCE.md)) |
| **Cache** | Edge cache respeitando `Cache-Control` | Cloudflare rules |
| **Origin** | Servir HLS bruto | HTTP/HTTPS |
| **Storage** | Persistir segmentos e manifests | Interno ao origin |

---

## 4. Fronteiras de contrato

- **Client ↔ Edge:** HTTP público, `/api/public/*`, sem auth, CORS `*`. Ver [`API_REFERENCE.md`](./API_REFERENCE.md).
- **Edge ↔ Origin:** HTTP interno via `fetch()`. Origin fixo em constante. Ver [`SECURITY.md § 8`](./SECURITY.md#8-ssrf).
- **UI ↔ Media Engine:** Interfaces TypeScript versionadas por semver. Ver [`MEDIA_ENGINE.md § 4`](./MEDIA_ENGINE.md).

---

## 5. Escopo

Esta arquitetura suporta hoje:
- ✅ TV Live (HLS de vídeo)
- ✅ Rádio Live (HLS de áudio)

E, com o Media Engine (futuro):
- 🔜 Podcasts (VOD de áudio)
- 🔜 VOD (vídeo sob demanda)
- 🔜 Clips / Shorts
- 🔜 Lives interativas
- 🔜 Qualquer novo player que siga o baseline
