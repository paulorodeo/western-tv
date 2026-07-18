# ADR-0003: Import dinâmico de `hls.js`

- **Status:** ✅ Accepted
- **Data:** 2026-07-18

## Contexto

`hls.js` empacotado tem ~120 KB gzip. Se importado estaticamente, entra no bundle principal de toda a aplicação — inclusive para usuários que:
- Nunca chegam a assistir (fecham a página cedo).
- Usam Safari (que não precisa da lib — usa HLS nativo).
- Estão em rotas onde o player não existe.

## Decisão

Usar `import()` dinâmico dentro de `useEffect`, apenas quando o player é ativado:

```ts
const Hls = (await import("hls.js")).default
if (Hls.isSupported()) { ... }
```

O import só dispara após o `IntersectionObserver` detectar o player na viewport.

## Alternativas consideradas

- **Import estático** — mais simples, mas penaliza LCP em ~120 KB para todos.
- **`<link rel="modulepreload">`** — não resolve o problema real; ainda faz download antecipado.
- **Server-side detection e injeção condicional** — complexo, não escala para SPA/route change.

## Consequências

### Positivas
- Bundle inicial não paga o custo de `hls.js`.
- Safari nunca baixa a lib.
- Sinergia com lazy activation ([ADR-0004](./0004-intersection-observer-lazy.md)) — só carrega quando faz falta.

### Negativas
- ~200-400ms de latência na primeira ativação para baixar o chunk.
- Mitigável com `modulepreload` seletivo em rotas críticas (não usado hoje).

### Neutras
- Chunk separado é cacheado pelo browser — segunda ativação é instantânea.

## Referências
- `src/components/LivePlayer.tsx`
- [`../PERFORMANCE.md § 2`](../PERFORMANCE.md#2-dynamic-import-de-hlsjs)
