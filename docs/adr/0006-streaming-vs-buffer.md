# ADR-0006: Streaming em vez de buffer no proxy

- **Status:** ✅ Accepted
- **Data:** 2026-07-18

## Contexto

O proxy pode encaminhar o upstream de duas formas:

1. **Buffer:** `const buf = await response.arrayBuffer(); return new Response(buf, ...)`.
2. **Streaming:** `return new Response(response.body, ...)`.

Cloudflare Workers têm limite de ~128 MB de memória e ~30s de CPU. Um segmento HLS grande (2-6 MB) multiplicado por muitos clientes concorrentes esgota memória rapidamente com buffer.

## Decisão

**Sempre streaming.** Passar `upstream.body` (ReadableStream) diretamente para o `Response` de saída, sem consumir.

## Alternativas consideradas

- **Buffer + transform** — só faria sentido se precisássemos reescrever URLs no manifesto (não é o caso hoje).
- **Buffer condicional** — complexidade sem benefício.

## Consequências

### Positivas
- Memória O(1) por request — independente do tamanho do segmento.
- TTFB (time to first byte) mínimo — o cliente começa a receber assim que o upstream começa a enviar.
- Escala horizontalmente sem tocar em nada.

### Negativas
- Não podemos transformar o body (ex.: reescrever URLs de segmentos no manifesto para forçar tudo pelo proxy).
  - **Mitigação futura:** se necessário, usar `TransformStream` para reescrever mantendo streaming.

### Neutras
- Web Streams API é suportada nativamente pelo runtime (Cloudflare Workers, Node 18+, Bun, Deno).

## Referências
- `src/routes/api/public/hls.$.ts` — `new Response(upstream.body, { status, headers })`
