# Ajustes finais da Suite de Documentação

A suite já foi criada no turno anterior. Este plano cobre apenas o **delta** solicitado.

## O que já existe (nenhuma ação)

Todos os itens 2-10 já foram entregues:

| Item pedido | Arquivo existente | Status |
|---|---|---|
| API Reference | `docs/API_REFERENCE.md` | ✅ Completo |
| Performance | `docs/PERFORMANCE.md` | ✅ Completo |
| Security | `docs/SECURITY.md` | ✅ Completo |
| Test Plan | `docs/TEST_PLAN.md` | ✅ Completo |
| Migração sem duplicar código | `docs/PLAYER_MIGRATION_GUIDE.md` | ✅ Já usa referências, não duplica arquivos inteiros |
| Diagrama global da plataforma | `docs/PLATFORM_ARCHITECTURE.md` + `/mnt/documents/Platform_Architecture.mmd` | ✅ Completo |
| Roadmap arquitetural (fases) | `docs/PLAYERS_ROADMAP.md` (Parte B com gantt) | ✅ Completo |
| Arquitetura Oficial de Referência | `docs/PLAYER_REFERENCE_ARCHITECTURE.md` | ✅ Completo (renomear — ver abaixo) |
| Critérios de Qualidade | `docs/QUALITY_CRITERIA.md` | ✅ Completo |
| ADRs | `docs/adr/0001-…` a `0009-…` | ✅ 9 ADRs |

## Delta a executar

### 1. Renomear (item 1)
- `docs/PLAYER_REFERENCE_ARCHITECTURE.md` → `docs/REFERENCE_ARCHITECTURE.md`
- Comando: `mv docs/PLAYER_REFERENCE_ARCHITECTURE.md docs/REFERENCE_ARCHITECTURE.md`

### 2. Atualizar referências ao arquivo renomeado
Ajustar links em:
- `docs/README.md` (2 ocorrências)
- `docs/TV_PLAYER.md`
- `docs/PLAYER_ARCHITECTURE.md` (se houver)
- `docs/PLAYER_MIGRATION_GUIDE.md`
- `docs/PLAYERS_ROADMAP.md`
- `docs/QUALITY_CRITERIA.md`
- `docs/adr/README.md`
- Qualquer ADR que referencie

Vou usar `rg` para localizar e `line_replace` para atualizar.

### 3. Criar `docs/COMPATIBILITY_MATRIX.md` (item 11) — NOVO
Matriz de compatibilidade entre navegadores/SOs e funcionalidades. Conteúdo:

- **Tabela principal** — Feature × (Chrome / Edge / Firefox / Safari / Chrome Android / Safari iOS)
- Cobrindo:
  - HLS via `hls.js`
  - HLS nativo
  - Autoplay muted
  - `playsInline`
  - Fullscreen
  - Picture-in-Picture (video)
  - Document Picture-in-Picture
  - Media Session API
  - Range requests
  - Web Audio API
  - Service Worker / PWA
  - Chromecast
  - AirPlay
  - Web Share API
  - localStorage
- **Legenda:** ✅ suportado / ⚠️ parcial / ❌ não / Nativo (usa HLS nativo em vez de hls.js)
- **Estratégia por feature** — o que o player faz em cada nível de suporte (progressive enhancement)
- **Referência de versões mínimas** — Chrome 116, Safari 18, Firefox 122 etc.
- Referências cruzadas para `TEST_PLAN.md` e `QUALITY_CRITERIA.md`

### 4. Atualizar `docs/README.md`
- Adicionar entrada para `COMPATIBILITY_MATRIX.md` na tabela de qualidade
- Corrigir link renomeado

## Entregáveis
- 1 rename
- 1 arquivo novo (`COMPATIBILITY_MATRIX.md`)
- Ajustes de links nos documentos existentes

## Fora do escopo
- Nenhum arquivo `.tsx`/`.ts` de runtime
- Nenhuma instalação
- Nenhuma reescrita dos documentos já entregues (só ajustes de links)
