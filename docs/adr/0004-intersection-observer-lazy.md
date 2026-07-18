# ADR-0004: Ativação preguiçosa via IntersectionObserver

- **Status:** ✅ Accepted
- **Data:** 2026-07-18

## Contexto

Iniciar HLS imediatamente no mount:
- Compete por banda com hero image (piora LCP).
- Consome dados do usuário mesmo se ele nunca chegar ao player.
- Em mobile, pode ser bloqueado por autoplay policies fora da viewport.

## Decisão

Usar `IntersectionObserver` com `rootMargin: 200px` para ativar HLS **apenas** quando o container está prestes a entrar na viewport. Sem clique explícito do usuário — a ativação é automática mas preguiçosa.

Também é oferecido botão explícito (poster idle) para ativação manual antes do scroll.

## Alternativas consideradas

- **Ativar no mount** — pior LCP, banda desperdiçada.
- **Ativar só ao clicar** — atrito de UX (usuário precisa dar 2 passos).
- **Requestidle callback** — não sabe se o player está visível.

## Consequências

### Positivas
- LCP não é penalizado.
- Autoplay muted funciona (o elemento está próximo da viewport quando ativa).
- Usuário que passa direto pelo player sem parar não paga banda.

### Negativas
- Delay adicional para o primeiro frame (mitigado pelo `rootMargin: 200px`).

### Neutras
- IntersectionObserver é suportado em 100% dos browsers alvo.

## Referências
- `src/components/LivePlayer.tsx` (useEffect com IO)
