# ADR-0005: TanStack Start como runtime

- **Status:** ✅ Accepted
- **Data:** 2026-07-18

## Contexto

Precisamos de:
- SSR para SEO.
- Server routes para o proxy HLS (streaming, CORS custom, Range).
- Deploy edge (Cloudflare Worker) para baixa latência global.
- Roteamento tipado.
- Vite 7 + React 19.

## Decisão

Usar **TanStack Start v1** (com TanStack Router file-based) como framework full-stack.

## Alternativas consideradas

- **Next.js 14+ (App Router)** — maduro, mas pesado para nossa escala; Edge Runtime tem restrições.
- **Remix v2** — bom, mas roteamento tipado é menos rico.
- **Astro** — não é ideal para app SPA-com-transmissão contínua.
- **SvelteKit** — excelente, mas time é React.

## Consequências

### Positivas
- Server routes (`createFileRoute` com handlers) resolvem o proxy nativamente.
- Roteamento tipado + head metadata inline.
- Deploy fácil em Cloudflare Workers via Vite plugin.
- Streaming responses (`new Response(readableStream, ...)`) suportados out-of-the-box.

### Negativas
- Framework mais novo — menor comunidade que Next.
- Algumas armadilhas (ver knowledge de Lovable sobre server functions vs. server routes).

### Neutras
- Nada específico ao player fica acoplado ao framework — o proxy é 20 linhas em qualquer stack.

## Referências
- [TanStack Start](https://tanstack.com/start)
- `src/routes/api/public/hls.$.ts`
