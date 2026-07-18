# Performance Guide

> Decisões de performance dos players. Cada item: **o que / por quê / trade-off**.
> Ver ADRs em [`docs/adr/`](./adr/).

---

## 1. Lazy Loading (IntersectionObserver)

**O que:** O `<video>` só é montado e o `hls.js` só é atachado quando o container entra na viewport (`rootMargin: 200px`).

**Por quê:**
- LCP mais baixo — o hero da página não compete com carregamento de manifesto/segmentos.
- Menos consumo de banda até o usuário demonstrar intenção.
- Melhor autoplay em mobile (browser mais permissivo quando o elemento entra na tela).

**Trade-off:**
- Primeiro frame chega ~200-400ms depois da rolagem.
- Mitigado pelo `rootMargin: 200px` — ativa antes do player entrar visualmente.

**ADR:** [ADR-0004](./adr/0004-intersection-observer-lazy.md).

---

## 2. Dynamic Import de `hls.js`

**O que:** `const Hls = (await import("hls.js")).default` dentro de `useEffect`, não import estático.

**Por quê:**
- `hls.js` empacotado tem ~120KB min+gz. Sem dynamic import isso vai para o bundle inicial de toda a aplicação.
- Com dynamic import, o chunk é carregado sob demanda **e só se** o player for ativado.
- Safari (que não precisa de `hls.js`) nunca baixa o pacote se o import for evitado.

**Trade-off:**
- Latência extra de rede na primeira ativação.
- Mitigado por `<link rel="modulepreload">` opcional em rotas críticas (não usado hoje).

**ADR:** [ADR-0003](./adr/0003-import-dinamico-hls.md).

---

## 3. Bundle Splitting

**O que:** TanStack Start + Vite fazem code-split por rota e por dynamic import automaticamente.

**Por quê:**
- `/` não carrega chunks de rotas API.
- `hls.js` fica em chunk separado.
- CSS crítico do route atual é priorizado.

**Trade-off:** Nenhum relevante — é ganho puro em stacks modernos.

---

## 4. Tree Shaking

**O que:** ESM em todo o projeto; `hls.js` exporta ESM.

**Por quê:** Vite/Rollup eliminam código morto. `hls.js` tem features opcionais (subtitles, alt-audio) que só entram se referenciadas.

**Trade-off:** Nenhum quando disciplina de ESM é mantida.

---

## 5. Streaming no Proxy

**O que:** `new Response(upstream.body, ...)` — repassa o `ReadableStream` sem `await response.arrayBuffer()`.

**Por quê:**
- Memória O(1) por request (crítico em Cloudflare Worker onde há limite de 128 MB).
- Latência do primeiro byte é mínima — o cliente começa a receber assim que o upstream começa a enviar.

**Trade-off:** Não é possível transformar o corpo (ex.: reescrever URLs no manifesto) sem sacrificar streaming. Se necessário no futuro, transformar em stream (`TransformStream`).

**ADR:** [ADR-0006](./adr/0006-streaming-vs-buffer.md).

---

## 6. Range Requests

**O que:** O header `Range` do cliente é encaminhado ao upstream; `Content-Range`, `Content-Length`, `Accept-Ranges` são expostos de volta.

**Por quê:**
- Permite ao `hls.js` retomar segmentos parciais em caso de falha de rede.
- Base para seek em VOD (futuro).
- Reduz retransmissões.

**Trade-off:** Nenhum — é padrão HTTP.

**ADR:** [ADR-0007](./adr/0007-range-requests.md).

---

## 7. Cache Strategy

| Recurso | Cache-Control | Motivo |
|---|---|---|
| `.m3u8` | `no-cache` | Janela deslizante — muda a cada ~6s |
| `.ts`, `.m4s`, `.aac` | `public, max-age=60` | Imutáveis dentro da janela |
| Upstream `ETag`/`Last-Modified` | Preservados | Permite `304 Not Modified` |

Cloudflare pode aplicar cache adicional na borda respeitando esses headers.

---

## 8. BackBuffer

**O que:** `hls.js` configurado com `backBufferLength: 30`.

**Por quê:**
- Guarda 30s de vídeo passado — permite pequeno rewind sem re-fetch.
- Limita crescimento indefinido de memória em sessões longas.

**Trade-off:**
- Sem rewind além de 30s (aceitável para live).
- 30s × ~500 KB/s ≈ 15 MB de memória por instância — aceitável.

---

## 9. Low Latency Mode

**O que:** `lowLatencyMode: true` no `hls.js`.

**Por quê:**
- Reduz latência ao vivo de ~30s para ~6-10s.
- Usa segmentos parciais (LL-HLS) quando o servidor suporta.

**Trade-off:**
- Requer manifesto compatível; degrada graciosamente se não houver.
- Mais requests, mais overhead HTTP.

---

## 10. Core Web Vitals — impacto esperado

| Métrica | Alvo | Como o player contribui |
|---|---|---|
| **LCP** | < 2.5s | Player não é o LCP (é a imagem do hero). Lazy prevenção de contenção. |
| **INP** | < 200ms | Controles são leves; nenhum trabalho pesado no click. |
| **CLS** | < 0.1 | `aspect-video` fixa dimensões antes do vídeo carregar. |
| **FCP** | < 1.8s | Nada síncrono do player bloqueia o first paint. |
| **TTFB** | < 800ms | Não depende do player. |

---

## 11. Lighthouse — alvos

| Categoria | Alvo |
|---|---|
| Performance | ≥ 90 (mobile), ≥ 95 (desktop) |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | 100 |

Auditar após qualquer mudança no player.

---

## 12. Uso de recursos

### Memória
- Buffer HLS ativo: ~15-25 MB (30s back + ~30s forward).
- `hls.js` runtime: ~5 MB.
- Total esperado: **< 40 MB por player ativo**.

### CPU
- Idle: ~0% (só timer de auto-hide de controles quando visível).
- Decode: depende do hardware; H.264 tem aceleração em ~100% dos devices.

### Rede
- Vídeo HD live: ~2-4 Mbps sustentado.
- Áudio HLS: ~128 kbps sustentado.
- Cache reduz re-fetch de segmentos em ~60% quando há multi-tab.

---

## 13. Preload do LCP

O player **não** é o LCP. O LCP recomendado é a imagem do hero. Preload via `head().links` da rota:

```ts
head: () => ({
  links: [{ rel: "preload", as: "image", href: "/hero.webp", fetchpriority: "high" }]
})
```

Ver knowledge de performance em Lovable.

---

## 14. Anti-metas

- ❌ Preload de `hls.js` no `<head>` — mata a vantagem do dynamic import.
- ❌ Buffer estendido (>60s back) — inflaciona memória sem benefício.
- ❌ Iniciar todos os players ao mesmo tempo — se houver mais de um na mesma tela, escalonar.
