# Architecture Decision Records (ADRs)

Registros das decisões arquiteturais importantes da Plataforma de Mídia.
Formato: [MADR](https://adr.github.io/madr/) simplificado.

---

## Índice

| # | Título | Status |
|---|---|---|
| [0001](./0001-usar-hls-js.md) | Usar `hls.js` como reprodutor HLS | ✅ Accepted |
| [0002](./0002-proxy-same-origin.md) | Proxy same-origin para HLS | ✅ Accepted |
| [0003](./0003-import-dinamico-hls.md) | Import dinâmico de `hls.js` | ✅ Accepted |
| [0004](./0004-intersection-observer-lazy.md) | Ativação preguiçosa via IntersectionObserver | ✅ Accepted |
| [0005](./0005-tanstack-start.md) | TanStack Start como runtime | ✅ Accepted |
| [0006](./0006-streaming-vs-buffer.md) | Streaming em vez de buffer no proxy | ✅ Accepted |
| [0007](./0007-range-requests.md) | Encaminhar Range requests no proxy | ✅ Accepted |
| [0008](./0008-media-session-api.md) | Adotar Media Session API (futuro) | 🟡 Proposed |
| [0009](./0009-document-picture-in-picture.md) | Document PiP como enhancement progressivo | 🟡 Proposed |

---

## Template

```markdown
# ADR-NNNN: <título>

- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
- **Data:** YYYY-MM-DD
- **Autor:** <nome>

## Contexto
<problema; o quê motivou a decisão>

## Decisão
<a decisão em si, em uma frase clara>

## Alternativas consideradas
- **Opção A:** <descrição, prós, contras>
- **Opção B:** <descrição, prós, contras>

## Consequências
### Positivas
- ...
### Negativas
- ...
### Neutras
- ...

## Referências
- Link para código, docs, discussões
```

## Regras

- **Um ADR por decisão.** Nunca mesclar.
- **Imutáveis após Accepted.** Mudanças criam um novo ADR que "supersedes" o anterior.
- **Curtos.** Se passar de 1 página, algo está errado.
- **Todo player novo que divergir do baseline exige ADR.** Ver [`../PLAYER_REFERENCE_ARCHITECTURE.md`](../PLAYER_REFERENCE_ARCHITECTURE.md).
