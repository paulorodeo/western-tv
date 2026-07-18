# ADR-0009: Document Picture-in-Picture como enhancement progressivo

- **Status:** 🟡 Proposed
- **Data:** 2026-07-18

## Contexto

Picture-in-Picture "clássico" (`HTMLVideoElement.requestPictureInPicture()`) só suporta um `<video>` — bom para TV, mas limita:
- **Rádio** (não tem vídeo; PiP clássico não aplica).
- **Player rico** com metadata, artwork, botões custom.

A nova **Document Picture-in-Picture API** (`window.documentPictureInPicture`, Chrome 116+) permite abrir uma janela flutuante do próprio SO com **HTML arbitrário** — o rádio pode ter artwork, título da faixa, botões de skip, tudo persistente.

## Decisão (proposta)

Implementar `openDocumentPip(node)` no Media Engine como **enhancement progressivo**:

- Se `window.documentPictureInPicture` existe → oferecer botão "Destacar player".
- Fallback graceful → usar `<FloatingShell>` sticky (que já é a UX atual do Rádio).

Não tornar obrigatório; é UX premium para usuários em Chrome/Edge desktop.

## Alternativas consideradas

- **Ignorar Doc PiP** — perde-se uma feature diferencial em desktops modernos.
- **Só PiP clássico** — não serve para rádio; para TV, é feature nativa do browser (menu de contexto) — podemos apenas garantir compatibilidade.

## Consequências

### Positivas
- Rádio segue tocando fora do navegador, com UI rica.
- TV pode ter PiP com controles custom (não apenas o do browser).
- Feature comum a usuários avançados (produtividade, multi-tarefa).

### Negativas
- Apenas Chrome/Edge/Chromium 116+ e Safari 26+ (compat limitada).
- Requer CSS extra para funcionar bem em janela pequena.
- Sem suporte no mobile.

### Neutras
- API é experimental mas estável na prática desde 2023.

## Referências
- [Document Picture-in-Picture Web API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)
- Fase 5 do roadmap: [`../PLAYERS_ROADMAP.md`](../PLAYERS_ROADMAP.md)
