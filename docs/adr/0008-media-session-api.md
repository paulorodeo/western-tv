# ADR-0008: Adotar Media Session API

- **Status:** 🟡 Proposed
- **Data:** 2026-07-18

## Contexto

Hoje o Radio Player toca em background mas:
- Lockscreen não mostra "Fazenda Rodeo Country".
- Botões de mídia (Bluetooth headset, teclas físicas) não controlam o player.
- Notificação de mídia do Android/iOS não aparece.

A **Media Session API** (`navigator.mediaSession`) resolve isso — o browser expõe metadata e handlers ao SO.

## Decisão (proposta)

Implementar `bindMediaSession(controller, metadata)` como serviço reutilizável do Media Engine ([`../MEDIA_ENGINE.md § 2.5`](../MEDIA_ENGINE.md)):

- Metadata: título da rádio, artista da faixa atual (via ID3), artwork.
- Action handlers: `play`, `pause`, `stop`, `previoustrack`, `nexttrack` (se aplicável).
- Unbind no destroy do player.

Aplicar primeiro no Radio Player; depois no TV Player.

## Alternativas consideradas

- **Não implementar** — perde-se experiência premium no lockscreen; usuários com AirPods/Bluetooth reclamam.
- **Implementar ad-hoc** dentro do RadioPlayer — funciona, mas duplica quando chegar no TV Player.

## Consequências

### Positivas
- Lockscreen com branding.
- Controles físicos funcionam (headset, teclas).
- Passo obrigatório para PWA de qualidade.

### Negativas
- API não é universal (Firefox mobile limitado).
- Metadata precisa de artwork em resoluções variadas (96, 128, 192, 256, 384, 512px).

### Neutras
- Progressive enhancement — funciona onde suportado, ignorado onde não.

## Referências
- [MDN: Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
- Fase 3 do roadmap: [`../PLAYERS_ROADMAP.md`](../PLAYERS_ROADMAP.md)
