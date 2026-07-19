# Arquitetura Oficial de Referência dos Players

> **Este é o baseline oficial.** Todo player futuro deve poder ser comparado ponto-a-ponto com este documento.
> Divergências exigem ADR justificando ([`adr/`](./adr/)).

---

## 1. Baseline

### 1.1 Arquivos canônicos
| Camada | Arquivo | Papel |
|---|---|---|
| UI | `src/components/LivePlayer.tsx` | Componente React do TV Player |
| UI | `src/components/RadioPlayer.tsx` | Componente React do Radio Player |
| Server | `src/routes/api/public/hls.$.ts` | Proxy HLS de vídeo |
| Server | `src/routes/api/public/radio.$.ts` | Proxy HLS de áudio |

### 1.2 Contratos invariantes

**Cliente:**
- Video/Audio element com `playsInline autoPlay muted` (mobile-first).
- `hls.js` importado dinamicamente; fallback para HLS nativo (Safari).
- Ativação preguiçosa por `IntersectionObserver` (`rootMargin: 200px`).
- Máquina de estados: `idle → loading → playing | paused | error`.
- Cleanup completo no unmount (destroy hls, remove listeners).

**Servidor:**
- Splat route sob `/api/public/` (bypass de auth).
- Handlers `GET`, `HEAD`, `OPTIONS`.
- CORS: `Allow-Origin: *`, `Allow-Methods: GET, HEAD, OPTIONS`.
- `Content-Type` correto por extensão (não `application/octet-stream`).
- Range requests propagadas (`Accept-Ranges` exposto).
- Streaming via `response.body` — nunca `await response.arrayBuffer()`.
- Cache: `no-cache` para `.m3u8`, `max-age=60` para segmentos.
- Origin em constante fixa (evita SSRF).

---

## 2. Rubrica de comparação

Todo novo player deve pontuar em cada eixo:

| Eixo | Critério | Peso |
|---|---|---|
| **Arquitetura** | UI ↔ lógica ↔ rede separadas em camadas | Obrigatório |
| **Proxy** | Same-origin com CORS + MIME correto | Obrigatório |
| **Lazy** | Ativação preguiçosa (IO ou click) | Obrigatório |
| **FSM** | Estados explícitos e transições documentadas | Obrigatório |
| **UI** | Controles sempre tapáveis em mobile | Obrigatório |
| **Acessibilidade** | ARIA labels, foco visível, teclado | Obrigatório |
| **Performance** | Dynamic import de hls.js; sem bloqueio de LCP | Obrigatório |
| **Segurança** | Origin fixo; sem input do usuário na URL upstream | Obrigatório |
| **SSR-safe** | Sem `window` em módulo; efeitos em `useEffect` | Obrigatório |
| **Media Session** | Registro de metadata e ações | Recomendado (V2) |
| **Doc PiP** | Enhancement progressivo | Recomendado (V3) |
| **Chromecast/AirPlay** | Suporte a receiver | Opcional (V3) |

---

## 3. Template de Relatório de Divergência

Sempre que um novo player divergir do baseline, preencher:

```markdown
# Divergência: <nome-do-player>

**Data:** YYYY-MM-DD
**Autor:** <nome>
**Referência:** REFERENCE_ARCHITECTURE.md v1.0

## 1. Diferenças
| Aspecto | Baseline | Este player | Motivo |
|---|---|---|---|
| ex.: Proxy | Same-origin | Direto no origin | Origin já tem CORS habilitado |

## 2. Impacto
- Funcional:
- Performance:
- Segurança:
- Manutenção:

## 3. Riscos
- <lista de riscos técnicos e de produto>

## 4. Vantagens
- <o que se ganha vs. o baseline>

## 5. Justificativa técnica
<parágrafo explicando por que a divergência é necessária>

## 6. Plano de migração
- [ ] Curto prazo: mitigação
- [ ] Médio prazo: retorno ao baseline OU
- [ ] ADR novo: promover divergência a padrão

## 7. ADR relacionado
- ADR-XXXX: <título>
```

---

## 4. Regra de ouro

> **Divergência sem ADR = débito técnico.**
> **Divergência com ADR = padrão aceito.**
> **Convergência ao baseline é o default; toda exceção é explícita.**
