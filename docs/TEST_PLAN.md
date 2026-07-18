# Plano de Testes — Players

> Matriz de compatibilidade e casos de teste para TV Player e Radio Player.

---

## 1. Matriz de compatibilidade

### 1.1 Navegadores × Sistemas Operacionais

| Navegador | Windows | macOS | Linux | Android | iOS |
|---|---|---|---|---|---|
| Chrome | ✅ obrigatório | ✅ obrigatório | ✅ obrigatório | ✅ obrigatório | N/A (usa WebKit) |
| Edge | ✅ obrigatório | ✅ recomendado | — | ✅ recomendado | N/A |
| Firefox | ✅ obrigatório | ✅ recomendado | ✅ obrigatório | ✅ recomendado | N/A |
| Safari | — | ✅ obrigatório | — | — | ✅ obrigatório |
| Brave | ✅ recomendado | ✅ recomendado | ✅ recomendado | ✅ recomendado | ✅ recomendado |

**Notas:**
- Safari desktop e iOS **não** usam `hls.js` — usam HLS nativo. Testar explicitamente.
- Chrome/Firefox em iOS = WebKit por baixo. Comportamento próximo ao Safari.

### 1.2 Dispositivos × Viewport

| Dispositivo | Viewport típico | Prioridade |
|---|---|---|
| Desktop | 1280+ | Alta |
| Laptop pequeno | 1024×768 | Alta |
| Tablet portrait | 768×1024 | Média |
| Tablet landscape | 1024×768 | Média |
| Smartphone padrão | 390×844 (iPhone) / 412×915 (Android) | **Crítica** |
| Smartphone pequeno | 360×640 | Alta |
| Smart TV | 1920×1080 | Média (Chrome-based) |

---

## 2. Suíte funcional

### 2.1 Reprodução básica
| # | Cenário | Passos | Aceite |
|---|---|---|---|
| F1 | Autoplay muted | Abrir página → aguardar player entrar na viewport | Player toca automaticamente, muted |
| F2 | Play/pause | Clicar no vídeo | Alterna play/pause |
| F3 | Unmute | Clicar no ícone de mute | Áudio volta; ícone atualiza |
| F4 | Volume | (n/a controle deslizante hoje; verificar via mute) | Estado consistente |
| F5 | Fullscreen | Clicar no botão fullscreen | Entra em fullscreen; ícone alterna |
| F6 | Sair de fullscreen | ESC ou botão | Retorna ao layout normal |

### 2.2 Estados
| # | Cenário | Passos | Aceite |
|---|---|---|---|
| S1 | Idle | Abrir página, sem scroll até o player | Overlay "Toque para assistir" visível |
| S2 | Loading | Ativar player | Overlay "Preparando transmissão" + shimmer |
| S3 | Playing | Aguardar buffering | Dot vermelho pulsando, "Ao vivo" |
| S4 | Paused | Pausar | Badge "Pausado" |
| S5 | Error | Bloquear `/api/public/hls/*` no DevTools → ativar | Overlay "Sinal indisponível" + botão retry |
| S6 | Retry | Clicar "Tentar novamente" após erro | Volta a `loading` e depois `playing` |

### 2.3 Lazy loading
| # | Cenário | Aceite |
|---|---|---|
| L1 | Player fora da viewport | Nenhum fetch de `.m3u8` no Network tab |
| L2 | Scroll aproxima 200px | Fetch inicia (`rootMargin: 200px`) |
| L3 | Múltiplas montagens (SPA nav) | Sem vazamento de listeners (verificar em DevTools Memory) |

### 2.4 Rede
| # | Cenário | Passos | Aceite |
|---|---|---|---|
| N1 | 3G lento | DevTools throttling Slow 3G | Player conecta em até 15s |
| N2 | Offline durante playback | DevTools offline | `status=loading` → `error` graciosamente |
| N3 | Volta a online | Cancelar offline | Retry manual funciona |
| N4 | Troca de rede (mobile) | WiFi → 4G | hls.js recupera (pode haver stall breve) |
| N5 | Bloqueio de proxy | Simular 500 em `/api/public/hls/*` | Estado error |

### 2.5 Mobile-specific
| # | Cenário | Aceite |
|---|---|---|
| M1 | iOS Safari `playsInline` | Player não entra em fullscreen do sistema |
| M2 | Tocar no vídeo (mobile) | Toggle play/pause funciona |
| M3 | Botão mute sempre acessível | Toque em mute funciona mesmo com controles ocultos |
| M4 | Orientação landscape | Layout se adapta |
| M5 | Fundo (background tab) | Sem consumo de CPU quando fora de foco |

### 2.6 Radio Player
| # | Cenário | Aceite |
|---|---|---|
| R1 | Sticky visible | Fica no bottom-right em todas as rotas |
| R2 | Expandir/minimizar | Toggle visual |
| R3 | Fechar (hidden) | Some completamente até reabertura |
| R4 | Status indicator | Verde=playing, âmbar=connecting, cinza=off, vermelho=error |
| R5 | Metadata ID3 | Nome da música aparece (best-effort) |

### 2.7 Futuras (V2/V3)
| # | Feature | Status |
|---|---|---|
| P1 | Picture-in-Picture (vídeo) | Não implementado |
| P2 | Document PiP | Não implementado |
| P3 | Chromecast | Não implementado |
| P4 | AirPlay | Não implementado |
| P5 | Media Session API | Não implementado |
| P6 | PWA offline | Não implementado |
| P7 | Legendas | Não implementado |
| P8 | Qualidade automática (ABR) | ✅ padrão do hls.js |
| P9 | Sleep timer (rádio) | Não implementado |
| P10 | Favoritos / Histórico (rádio) | Não implementado |

Detalhes em [`PLAYERS_ROADMAP.md`](./PLAYERS_ROADMAP.md).

---

## 3. Casos de regressão manual (por release)

Antes de publicar mudança no player, executar:

- [ ] F1, F2, F3, F5 em Chrome desktop
- [ ] F1, F2 em Safari desktop
- [ ] F1, F2, F3, M1, M2, M3 em Safari iOS real
- [ ] F1, F2, F3 em Chrome Android real
- [ ] S1 → S2 → S3 → S4 → S3 (fluxo completo)
- [ ] S5 → S6 (erro + retry)
- [ ] L1 → L2 (lazy)
- [ ] N2 → N3 (offline recovery)
- [ ] R1 → R2 → R3 (radio floating)

---

## 4. Automação (Playwright)

Prioridades para automação:

1. **Alta:** F1, S1-S3, L1-L2 — cobertos via DevTools/Playwright headless.
2. **Média:** N1, N5 — throttling programático.
3. **Baixa:** M1-M5 — dispositivos reais recomendados; emulação Playwright cobre 80%.

Não automatizar:
- Verificação subjetiva de qualidade de vídeo/áudio.
- Reprodução real em Smart TVs (BrowserStack / testes manuais).

---

## 5. Ferramentas

| Ferramenta | Uso |
|---|---|
| DevTools (Chrome/Firefox) | Network throttle, Memory, Performance |
| Playwright | Automação headless + mobile emulation |
| BrowserStack / LambdaTest | Dispositivos reais |
| Lighthouse | Perf + a11y (ver [`PERFORMANCE.md`](./PERFORMANCE.md)) |
| Curl | Validar API (ver [`API_REFERENCE.md`](./API_REFERENCE.md)) |
