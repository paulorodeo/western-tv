# Guia de Migração dos Players

> Como reproduzir o TV Player e o Radio Player em outro projeto **sem consultar o código-fonte original**.
> Este guia documenta estrutura, responsabilidades e pontos críticos — não duplica arquivos.
> Referências: [`TV_PLAYER.md`](./TV_PLAYER.md), [`API_REFERENCE.md`](./API_REFERENCE.md), [`SECURITY.md`](./SECURITY.md).

---

## 1. Checklist de migração

- [ ] Framework alvo suporta server routes / API handlers com streaming (`Response(body)`).
- [ ] Framework alvo suporta rotas splat (catch-all).
- [ ] `hls.js` disponível como npm package.
- [ ] Página alvo é HTTPS (requerido pelo browser para HLS).
- [ ] Origin HLS acessível a partir do runtime (não bloqueado por firewall).
- [ ] Design system definido (fontes, cores, tokens).

---

## 2. Dependências

```bash
# Único dependência crítica:
bun add hls.js

# Framework — escolha um:
bun add @tanstack/react-router @tanstack/react-start   # (referência)
# ou Next.js 14+, Remix, Hono, Express, etc.
```

Versão validada: `hls.js@^1.6.16`.

---

## 3. Estrutura esperada no projeto-alvo

```text
src/
├── components/
│   ├── LivePlayer.tsx        # TV Player
│   └── RadioPlayer.tsx       # (opcional) Radio Player
├── routes/
│   ├── index.tsx             # importa <LivePlayer />
│   └── api/public/
│       ├── hls.$.ts          # proxy TV
│       └── radio.$.ts        # (opcional) proxy Rádio
```

---

## 4. Responsabilidades de cada arquivo

Consulte [`TV_PLAYER.md § 7`](./TV_PLAYER.md#7-engenharia-reversa--arquivo-por-arquivo) para engenharia reversa completa.

### 4.1 `LivePlayer.tsx`
Responsável por:
- Ativar HLS quando o container entra na viewport (`IntersectionObserver`, `rootMargin: 200px`).
- Fazer `import()` dinâmico de `hls.js`.
- Detectar suporte (`Hls.isSupported()`) e cair para HLS nativo (`canPlayType("application/vnd.apple.mpegurl")`) em Safari.
- Gerenciar FSM: `idle → loading → playing | paused | error`.
- Escutar eventos `playing/waiting/pause/error` do `<video>` + `Events.ERROR` do hls.
- Botão de retry que remonta o HLS (toggle `activated`).
- Auto-hide de controles após 3.2s de inatividade.
- Cleanup completo no unmount (destroy hls, remove listeners, cancel flag).

### 4.2 `hls.$.ts` (proxy)
Responsável por:
- Handlers `OPTIONS` (204 preflight), `GET`, `HEAD`.
- Encaminhar `Range` header para upstream.
- Sobrescrever `Content-Type` por extensão (nunca `octet-stream` para `.m3u8`/`.ts`).
- Anexar CORS headers em toda resposta.
- Streaming via `new Response(upstream.body, ...)`.
- Cache: `no-cache` para manifesto, `max-age=60` para segmentos.

---

## 5. Principais trechos (referência de contrato)

### 5.1 Assinatura do proxy
```ts
const ORIGIN = "https://tv.fazenda.rodeo/hls/"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
}

function contentTypeFor(path: string): string | null { /* por extensão */ }
async function proxy(request, splat, method): Promise<Response> { /* stream */ }
```

### 5.2 Ativação preguiçosa
```ts
useEffect(() => {
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) setActivated(true)
  }, { rootMargin: "200px" })
  io.observe(containerRef.current!)
  return () => io.disconnect()
}, [])
```

### 5.3 Import dinâmico + fallback Safari
```ts
const Hls = (await import("hls.js")).default
if (Hls.isSupported()) {
  const hls = new Hls({ lowLatencyMode: true, backBufferLength: 30 })
  hls.loadSource(STREAM_URL); hls.attachMedia(video)
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  video.src = STREAM_URL   // Safari nativo
}
```

---

## 6. Fluxo de execução resumido

```text
mount → observer → inView → activated → import(hls.js) → new Hls()
     → loadSource(proxy URL) → attachMedia(video) → play() → status=playing
```

Detalhes: [`PLAYER_ARCHITECTURE.md § 6`](./PLAYER_ARCHITECTURE.md#6-ciclo-de-vida-completo).

---

## 7. Pontos críticos

| Item | Detalhe |
|---|---|
| **Prefixo `/api/public/`** | Bypassa autenticação em plataformas Lovable/TanStack Start. Adaptar em outros frameworks. |
| **Range requests** | Sem propagar Range, seek e recuperação de segmentos falham. |
| **MIME correto** | `.m3u8` **deve** ser `application/vnd.apple.mpegurl`. `application/octet-stream` faz hls.js falhar. |
| **CORS preflight** | Browsers enviam OPTIONS para requests com Range. Sem handler OPTIONS → falha. |
| **Autoplay muted** | Todo browser exige `muted` + `playsInline` para autoplay sem gesto do usuário. |
| **`playsInline`** | Sem ele, iOS abre em player fullscreen próprio. |
| **HTTPS** | Página HTTPS + origin HTTPS. Mixed content bloqueia HLS. |
| **Cleanup** | `hls.destroy()` no unmount, senão vazamento de memória. |
| **Flag `cancelled`** | Import dinâmico pode resolver após unmount. |

---

## 8. Adaptações por framework

### Next.js (App Router)
```ts
// app/api/public/hls/[...path]/route.ts
export async function GET(req, { params }) {
  return proxy(req, params.path.join("/"), "GET")
}
export async function OPTIONS() { return new Response(null, { status: 204, headers: CORS }) }
```

### Remix
```ts
// app/routes/api.public.hls.$.tsx
export async function loader({ request, params }) {
  return proxy(request, params["*"]!, "GET")
}
```

### Hono
```ts
app.get("/api/public/hls/*", c => proxy(c.req.raw, c.req.param("*"), "GET"))
app.options("/api/public/hls/*", c => new Response(null, { status: 204, headers: CORS }))
```

### Express (Node)
```ts
// Requer `node-fetch` ou Node 18+ fetch
app.get("/api/public/hls/*", async (req, res) => { /* pipe response.body */ })
```

### Cloudflare Workers (fetch handler)
```ts
export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    if (url.pathname.startsWith("/api/public/hls/")) {
      return proxy(req, url.pathname.slice("/api/public/hls/".length), req.method)
    }
  }
}
```

---

## 9. Erros comuns

| Erro | Causa | Fix |
|---|---|---|
| `Manifest load failed` / `PARSING_ERROR` | Content-Type `octet-stream` | Corrigir MIME no proxy |
| CORS blocked | Sem headers CORS ou sem OPTIONS handler | Adicionar CORS + OPTIONS |
| Vídeo pausa após 1º segmento | Range requests não propagadas | Encaminhar `Range` no proxy |
| Autoplay bloqueado | Sem `muted` ou sem `playsInline` | Adicionar ambos |
| Vazamento de memória | Sem `hls.destroy()` | Cleanup no `useEffect` |
| Race no unmount | Import assíncrono resolve após unmount | Flag `cancelled` |
| Safari não toca | Usando `hls.js` (Safari tem HLS nativo) | Fallback `video.canPlayType("application/vnd.apple.mpegurl")` |
| Mixed content | Página HTTPS + origin HTTP | Origin **deve** ser HTTPS |

---

## 10. Validação final

### 10.1 Via `curl`
```bash
# Preflight CORS
curl -i -X OPTIONS https://SEU-APP.exemplo.com/api/public/hls/live.m3u8 \
  -H "Origin: https://outro.com" \
  -H "Access-Control-Request-Method: GET"
# → 204 + Access-Control-Allow-Origin: *

# Manifest
curl -i https://SEU-APP.exemplo.com/api/public/hls/live.m3u8
# → 200, Content-Type: application/vnd.apple.mpegurl

# Range
curl -i https://SEU-APP.exemplo.com/api/public/hls/seg1.ts -H "Range: bytes=0-1023"
# → 206 Partial Content, Content-Range: bytes 0-1023/...
```

### 10.2 Checklist visual
- [ ] Chrome desktop: carrega, toca, fullscreen, mute funciona
- [ ] Firefox desktop: idem
- [ ] Safari desktop: idem (usa HLS nativo)
- [ ] Chrome Android: autoplay muted funciona, controles tapáveis
- [ ] Safari iOS: `playsInline` mantém player embutido, autoplay muted OK
- [ ] Estado idle → clique/scroll → loading → playing
- [ ] Retry após simular erro (bloquear origin no devtools) volta a funcionar
- [ ] Sem vazamento após múltiplas montagens/desmontagens (DevTools Memory)

---

## 11. Referências cruzadas
- [`TV_PLAYER.md`](./TV_PLAYER.md) — código descrito arquivo-por-arquivo
- [`API_REFERENCE.md`](./API_REFERENCE.md) — contrato completo dos endpoints
- [`SECURITY.md`](./SECURITY.md) — SSRF, CORS, mixed content
- [`PERFORMANCE.md`](./PERFORMANCE.md) — decisões e trade-offs
