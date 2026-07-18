# ADR-0001: Usar `hls.js` como reprodutor HLS

- **Status:** ✅ Accepted
- **Data:** 2026-07-18

## Contexto

Precisamos reproduzir HLS (`.m3u8` + segmentos `.ts`/`.m4s`) em browsers. HLS nativo só existe no Safari (macOS/iOS). Chrome, Firefox, Edge e derivados exigem Media Source Extensions (MSE) + parser JS.

## Decisão

Adotar **`hls.js`** como reprodutor cross-browser, com **fallback para HLS nativo do Safari** via `video.canPlayType("application/vnd.apple.mpegurl")`.

## Alternativas consideradas

- **Shaka Player** — Google, muito completo, mas maior (~300KB) e over-engineered para nosso caso (sem DRM hoje).
- **video.js + plugin HLS** — API pesada, muitas features não usadas, wrapper adicional sobre `hls.js`.
- **Media Source Extensions manual** — reinventar a roda; hls.js é maduro e mantido.
- **JW Player / Bitmovin / THEOplayer** — comerciais, licença cara, features excessivas.

## Consequências

### Positivas
- ~120 KB gzip; aceitável com dynamic import (ver [ADR-0003](./0003-import-dinamico-hls.md)).
- Cobertura de Chrome, Firefox, Edge, Brave, Opera, Chrome Android.
- Suporte a Low Latency HLS (LL-HLS).
- Ecossistema ativo, releases regulares.

### Negativas
- Não é player pronto — precisamos construir a UI (mas isso é intencional para o design premium).
- Sem DRM out-of-the-box (aceitável; DRM é V3).

### Neutras
- Safari usa código nativo, não a lib; menos superfície de bug para testar.

## Referências
- [hls.js](https://github.com/video-dev/hls.js)
- `src/components/LivePlayer.tsx`
