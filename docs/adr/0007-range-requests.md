# ADR-0007: Encaminhar Range requests no proxy

- **Status:** ✅ Accepted
- **Data:** 2026-07-18

## Contexto

`hls.js` faz Range requests para:
- Retomar downloads interrompidos.
- Fetch parcial de segmentos (LL-HLS parts).
- Base para seek em VOD.

Se o proxy não encaminhar o header `Range`, o upstream serve o segmento inteiro (200 OK em vez de 206 Partial), o que:
- Descarta bytes já baixados em retentativas.
- Impede segmentos parciais (LL-HLS).
- Bloqueia futuras features de VOD (seek eficiente).

## Decisão

**Sempre encaminhar `Range` para o upstream** e propagar de volta:
- `Content-Range`
- `Content-Length`
- `Accept-Ranges`
- Status 206 (Partial Content) preservado.

## Alternativas consideradas

- **Ignorar Range** — quebra recuperação de falhas e LL-HLS.
- **Reescrever para múltiplos Range** — complexidade sem ganho.

## Consequências

### Positivas
- Recovery de rede eficiente.
- LL-HLS funcional.
- Base para seek/DVR/VOD sem alterar o proxy.

### Negativas
- Nenhuma relevante — é comportamento HTTP padrão.

### Neutras
- Requer `Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges` para o browser ler os valores em código JS (não obrigatório para o `<video>`, mas útil para diagnóstico).

## Referências
- `src/routes/api/public/hls.$.ts` — encaminha `Range` no upstream fetch, expõe `Accept-Ranges` no CORS.
- [MDN: Range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)
