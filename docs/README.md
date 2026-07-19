# Arquitetura Oficial da Plataforma de Mídia — Fazenda Rodeo

> **Esta suite de documentos é a Arquitetura Oficial de Referência da Plataforma de Mídia da Fazenda Rodeo.**
>
> Todos os players atuais e futuros — TV, Rádio, Podcasts, VOD, Clips, Shorts, Lives — devem seguir esta arquitetura. Qualquer divergência exige um **ADR** justificando a decisão (ver `docs/adr/`).

---

## 📚 Índice

### Referência arquitetural
| Documento | Propósito |
|---|---|
| [`REFERENCE_ARCHITECTURE.md`](./REFERENCE_ARCHITECTURE.md) | **Baseline oficial.** Rubrica de comparação e template de divergência. |
| [`PLATFORM_ARCHITECTURE.md`](./PLATFORM_ARCHITECTURE.md) | Diagrama global da plataforma (Browser → Media Engine → Proxy → Origin). |
| [`PLAYER_ARCHITECTURE.md`](./PLAYER_ARCHITECTURE.md) | Componentes, hooks, server routes, fluxos, ciclo de vida. |
| [`MEDIA_ENGINE.md`](./MEDIA_ENGINE.md) | Especificação dos módulos do núcleo de mídia compartilhado. |
| [`PLAYER_FUTURE_ARCHITECTURE.md`](./PLAYER_FUTURE_ARCHITECTURE.md) | Evolução para núcleo compartilhado entre players. |

### Implementação atual
| Documento | Propósito |
|---|---|
| [`TV_PLAYER.md`](./TV_PLAYER.md) | Documentação técnica completa + engenharia reversa do TV Player. |
| [`API_REFERENCE.md`](./API_REFERENCE.md) | Endpoints `/api/public/hls/*` e `/api/public/radio/*`. |
| [`PLAYER_MIGRATION_GUIDE.md`](./PLAYER_MIGRATION_GUIDE.md) | Guia para reproduzir o player em outro projeto. |

### Qualidade e operação
| Documento | Propósito |
|---|---|
| [`PERFORMANCE.md`](./PERFORMANCE.md) | Lazy loading, dynamic imports, streaming, cache, Core Web Vitals. |
| [`SECURITY.md`](./SECURITY.md) | CORS, CSP, HTTPS, SSRF, rate limit, DRM (futuro). |
| [`TEST_PLAN.md`](./TEST_PLAN.md) | Matriz de testes: navegadores × SO × dispositivos × features. |
| [`QUALITY_CRITERIA.md`](./QUALITY_CRITERIA.md) | Requisitos mínimos para novos players. |
| [`COMPATIBILITY_MATRIX.md`](./COMPATIBILITY_MATRIX.md) | Matriz de compatibilidade navegadores × features + estratégia de progressive enhancement. |

### Planejamento
| Documento | Propósito |
|---|---|
| [`PLAYERS_ROADMAP.md`](./PLAYERS_ROADMAP.md) | Roadmap funcional (por player) + roadmap técnico (por fase). |
| [`adr/`](./adr/) | Architecture Decision Records — uma decisão por arquivo. |

---

## 🧭 Mapa de leitura por papel

- **Product Manager / Stakeholder** → `README.md` → `PLAYERS_ROADMAP.md` → `PLATFORM_ARCHITECTURE.md`
- **Dev iniciando no projeto** → `TV_PLAYER.md` → `PLAYER_ARCHITECTURE.md` → `API_REFERENCE.md`
- **Dev replicando em outro projeto** → `PLAYER_MIGRATION_GUIDE.md` → `TV_PLAYER.md` → `API_REFERENCE.md`
- **Auditor de segurança/performance** → `SECURITY.md` → `PERFORMANCE.md` → `adr/`
- **Arquiteto propondo mudança** → `REFERENCE_ARCHITECTURE.md` → template de divergência → novo ADR
- **QA** → `TEST_PLAN.md` → `COMPATIBILITY_MATRIX.md` → `QUALITY_CRITERIA.md`

---

## 🛡️ Regra de ouro

> **Qualquer player desenvolvido para a plataforma deve poder ser comparado ponto-a-ponto com esta arquitetura. Divergências sem ADR são débito técnico.**

Escopo desta suite:

- ✅ TV Player (Live HLS)
- ✅ Radio Player (HLS de áudio)
- 🔜 Podcasts (VOD de áudio)
- 🔜 VOD (vídeo sob demanda)
- 🔜 Clips / Shorts
- 🔜 Lives interativas
- 🔜 Qualquer player futuro da plataforma

---

## 🗓️ Versão

- **v1.0** — Julho 2026 — Documentação inicial baseada na implementação atual do TV Player e Radio Player.
