# Matriz de Compatibilidade

Compatibilidade entre navegadores/SOs e funcionalidades da **Plataforma de Mídia Fazenda Rodeo**. Este documento é referência oficial para decisões de progressive enhancement e critério mínimo de suporte para novos players.

Referências cruzadas:
- [`REFERENCE_ARCHITECTURE.md`](./REFERENCE_ARCHITECTURE.md) — arquitetura oficial
- [`TEST_PLAN.md`](./TEST_PLAN.md) — matriz de testes correspondente
- [`QUALITY_CRITERIA.md`](./QUALITY_CRITERIA.md) — requisitos mínimos
- [`PLAYERS_ROADMAP.md`](./PLAYERS_ROADMAP.md) — o que já está suportado × previsto

---

## 1. Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Suportado nativamente e habilitado no player |
| Nativo | Suportado via API nativa do navegador (não usa polyfill/lib) |
| ⚠️ | Parcial — funciona com limitações ou requer fallback |
| ❌ | Não suportado — feature desabilitada silenciosamente |
| 🧪 | Experimental / atrás de flag |

**Regra de ouro:** nenhuma feature ❌ pode quebrar a experiência básica de reprodução. Todas as ausências devem ser tratadas por progressive enhancement.

---

## 2. Matriz principal — Desktop

| Funcionalidade | Chrome 116+ | Edge 116+ | Firefox 122+ | Safari 17+ |
|----------------|:-----------:|:---------:|:------------:|:----------:|
| HLS via `hls.js` (MSE)          | ✅ | ✅ | ✅ | ✅ |
| HLS nativo (`canPlayType`)      | ❌ | ❌ | ❌ | Nativo |
| Autoplay muted                  | ✅ | ✅ | ✅ | ✅ |
| Autoplay com áudio              | ⚠️ user-gesture | ⚠️ user-gesture | ⚠️ user-gesture | ❌ |
| Fullscreen API                  | ✅ | ✅ | ✅ | ✅ (`webkit`) |
| Picture-in-Picture (vídeo)      | ✅ | ✅ | ✅ | ✅ |
| Document Picture-in-Picture     | ✅ | ✅ | ❌ | ❌ |
| Media Session API               | ✅ | ✅ | ⚠️ básico | ⚠️ básico |
| Web Audio API                   | ✅ | ✅ | ✅ | ✅ |
| Range Requests (segmentos)      | ✅ | ✅ | ✅ | ✅ |
| Service Worker / PWA install    | ✅ | ✅ | ✅ | ⚠️ macOS 14+ |
| Chromecast (Cast SDK)           | ✅ | ✅ | ❌ | ❌ |
| AirPlay                         | ❌ | ❌ | ❌ | ✅ |
| Web Share API                   | ⚠️ HTTPS | ⚠️ HTTPS | ❌ | ✅ |
| localStorage                    | ✅ | ✅ | ✅ | ✅ |
| `IntersectionObserver`          | ✅ | ✅ | ✅ | ✅ |

---

## 3. Matriz principal — Mobile

| Funcionalidade | Chrome Android | Samsung Internet | Firefox Android | Safari iOS 17+ |
|----------------|:--------------:|:----------------:|:---------------:|:--------------:|
| HLS via `hls.js` (MSE)          | ✅ | ✅ | ✅ | ❌ (usa nativo) |
| HLS nativo                      | ❌ | ❌ | ❌ | Nativo |
| `playsInline`                   | ✅ | ✅ | ✅ | ✅ (obrigatório) |
| Autoplay muted                  | ✅ | ✅ | ✅ | ✅ |
| Autoplay com áudio              | ❌ | ❌ | ❌ | ❌ |
| Fullscreen API                  | ✅ | ✅ | ✅ | ⚠️ apenas `<video>` (`webkitEnterFullscreen`) |
| Picture-in-Picture              | ✅ Android 8+ | ✅ | ⚠️ | ✅ iOS 14+ |
| Document Picture-in-Picture     | 🧪 flag | ❌ | ❌ | ❌ |
| Media Session API               | ✅ | ✅ | ⚠️ | ✅ |
| Chromecast                      | ✅ (Sender) | ✅ | ❌ | ❌ |
| AirPlay                         | ❌ | ❌ | ❌ | ✅ |
| Service Worker / PWA (A2HS)     | ✅ | ✅ | ⚠️ | ⚠️ WebApp iOS 16.4+ |
| Web Share API                   | ✅ | ✅ | ⚠️ | ✅ |

---

## 4. Estratégia por feature (Progressive Enhancement)

### HLS
- Se `Hls.isSupported()` → carrega `hls.js` (dynamic import).
- Senão, se `video.canPlayType('application/vnd.apple.mpegurl')` → atribui `src` direto (Safari/iOS).
- Fallback final: mensagem "Navegador incompatível" com link para atualizar.

### Fullscreen
- Prefixo padrão: `requestFullscreen` → fallback `webkitRequestFullscreen` (Safari) → fallback `webkitEnterFullscreen` no elemento `<video>` (iOS).

### Autoplay
- Sempre iniciar `muted={true}` + `playsInline`. Desmutar apenas após interação do usuário.
- Nunca chamar `.play()` sem `muted` no primeiro render.

### Media Session
- Detectar `'mediaSession' in navigator` antes de setar `metadata` e `setActionHandler`.
- Onde parcial (Firefox/Safari desktop antigos), apenas `metadata` — evitar `setPositionState`.

### Document PiP
- Detectar `'documentPictureInPicture' in window`. Ausente → esconder o botão.

### Chromecast / AirPlay
- Cast SDK só carrega sob demanda em Chrome/Edge.
- AirPlay: renderizar `<x-airplay-button>` (ou `webkitShowPlaybackTargetPicker`) apenas em Safari.

### PWA
- Instalável obrigatoriamente em Chrome/Edge/Android. iOS/Safari — instruções "Adicionar à Tela de Início".

---

## 5. Versões mínimas oficiais

Baseline suportada pela plataforma (menor esforço = melhor cobertura):

| Navegador | Versão mínima | Justificativa |
|-----------|--------------|---------------|
| Chrome / Edge (Chromium) | 116 | MSE estável + Doc PiP |
| Firefox | 122 | MSE + Fullscreen API padrão |
| Safari macOS | 17 | HLS nativo + Media Session |
| Safari iOS | 17 | `playsInline` + PWA maduro |
| Chrome Android | 116 | MSE + Media Session |
| Samsung Internet | 22 | Compatível com baseline Chromium |

Versões abaixo do baseline recebem apenas playback básico sem features avançadas — não são bloqueadas.

---

## 6. Matriz de sistemas operacionais

| SO | Prioridade de teste | Observações |
|----|:-------------------:|-------------|
| Windows 10/11 | P0 | Chrome + Edge |
| macOS 13+ | P0 | Safari + Chrome |
| Android 10+ | P0 | Chrome + Samsung Internet |
| iOS 17+ | P0 | Safari (WebKit obrigatório) |
| Linux (Ubuntu 22+) | P1 | Chrome + Firefox |
| Smart TV (Tizen/webOS) | P2 | HLS nativo, sem Doc PiP |
| iPadOS 17+ | P1 | Comporta como Safari macOS a partir de 13+ |

---

## 7. Impacto no roadmap

Features marcadas como ❌ em Safari/iOS que estão no [`PLAYERS_ROADMAP.md`](./PLAYERS_ROADMAP.md):

- **Document PiP** — MVP apenas Chromium; Safari via fallback (PiP nativo do `<video>`)
- **Chromecast** — não expor UI em Safari/Firefox
- **AirPlay** — não expor UI em Chrome/Firefox
- **Autoplay com áudio** — nunca; toda plataforma inicia mutada

---

## 8. Processo para adicionar feature nova

1. Documentar suporte por navegador nesta matriz **antes** de implementar.
2. Definir estratégia de fallback na seção 4.
3. Se a feature exigir versão maior que o baseline (seção 5), abrir ADR justificando.
4. Adicionar caso de teste correspondente em [`TEST_PLAN.md`](./TEST_PLAN.md).
5. Marcar na matriz o estado real após implementação (✅/⚠️/❌).

---

**Owner:** Time de Arquitetura de Mídia · **Última revisão:** 2026-07 · **Frequência de revisão:** trimestral.
