# ADR-0002: Proxy same-origin para HLS

- **Status:** ✅ Accepted
- **Data:** 2026-07-18

## Contexto

O origin HLS (`https://tv.fazenda.rodeo/hls/`) apresentava dois problemas:

1. **Sem CORS.** Browsers bloqueiam `fetch` cross-origin sem `Access-Control-Allow-Origin`. O `hls.js` faz `fetch` para manifesto/segmentos e falha silenciosamente.
2. **Content-Type incorreto.** Retornava `application/octet-stream` para `.m3u8`, o que faz o `hls.js` recusar o manifesto ("Manifest parse error").

Editar o origin não era viável a curto prazo (infraestrutura externa).

## Decisão

Criar um **proxy same-origin** em `/api/public/hls/*` (splat route TanStack Start) que:
- Encaminha o path para `https://tv.fazenda.rodeo/hls/*`.
- Anexa CORS headers (`Access-Control-Allow-Origin: *`).
- Corrige `Content-Type` por extensão (`.m3u8` → `application/vnd.apple.mpegurl`, `.ts` → `video/mp2t`).
- Propaga `Range` requests (ver [ADR-0007](./0007-range-requests.md)).
- Faz streaming via `response.body` (ver [ADR-0006](./0006-streaming-vs-buffer.md)).

O cliente aponta `hls.js` para `/api/public/hls/live.m3u8` — que é sempre same-origin da página.

## Alternativas consideradas

- **Corrigir CORS no origin** — depende de time externo; timeline incerto.
- **Habilitar mixed CORS anywhere** — inseguro e frágil.
- **Servir o vídeo direto do próprio origin (upload/republicação)** — inviável para live.

## Consequências

### Positivas
- Resolve CORS + MIME de uma só vez, sem tocar no origin.
- Latência adicional mínima (streaming, edge Cloudflare).
- Base para futuras features: rate limit, auth, signed URLs.
- Isolamento — se o origin muda de host, só o proxy é atualizado.

### Negativas
- Uma camada extra na cadeia (impacto mínimo — Cloudflare edge).
- Custo de banda passa pelo Cloudflare (mas geralmente incluído em planos).

### Neutras
- Cache pode ser controlado explicitamente no proxy.

## Referências
- `src/routes/api/public/hls.$.ts`
- `src/routes/api/public/radio.$.ts`
- [`../API_REFERENCE.md`](../API_REFERENCE.md)
