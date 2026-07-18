# Security Guide

> Postura de segurança dos players e do proxy de mídia.

---

## 1. CORS

**Configuração atual:** `Access-Control-Allow-Origin: *` em `/api/public/hls/*` e `/api/public/radio/*`.

**Por que é seguro:**
- O proxy só serve conteúdo público de mídia — nenhuma PII, cookie ou dado autenticado.
- Wildcard não afeta cookies (`Allow-Credentials` **não** é enviado).
- O origin upstream é fixo em constante do servidor; o cliente não consegue redirecionar para outra origem.

**Quando restringir:**
- Se surgir necessidade de vídeo autenticado (VOD pago, DRM), migrar para allow-list explícita de origens + `Allow-Credentials`.

---

## 2. Content Security Policy (CSP)

**Recomendação para a página que embeda o player:**

```http
Content-Security-Policy:
  default-src 'self';
  media-src 'self' blob:;
  connect-src 'self';
  img-src 'self' data: https://*.fazenda.rodeo https://country.fazenda.rodeo;
  script-src 'self' 'unsafe-inline';   /* Vite dev usa inline; ajustar em prod se possível */
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-ancestors 'self';
```

**Pontos-chave:**
- `media-src 'self'` — vídeo/áudio só do próprio origin (o proxy resolve isso).
- `connect-src 'self'` — `fetch` de manifestos/segmentos vai para `/api/public/*` (same-origin).
- `blob:` em `media-src` habilita o `MSE` usado pelo `hls.js`.
- Não permitir `frame-ancestors *` — evita clickjacking / hotlinking em iframe.

---

## 3. HTTPS obrigatório

- Página **deve** ser servida via HTTPS.
- Origin upstream **deve** ser HTTPS.
- **Mixed Content:** um único recurso HTTP numa página HTTPS bloqueia todo o playback HLS.

---

## 4. Proxy same-origin como mitigação

O proxy é a defesa central:
- Resolve CORS sem tocar no upstream.
- Corrige MIME (previne ataques de content sniffing).
- Isola o cliente do upstream — se o upstream ficar comprometido, o cliente não expõe cabeçalhos sensíveis.

---

## 5. Headers de segurança recomendados

```http
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN            /* ou CSP frame-ancestors */
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: fullscreen=(self), picture-in-picture=(self)
```

---

## 6. Cache — evitar cache de conteúdo sensível

Regra atual:
- Manifestos: `no-cache` (nunca ficam em cache de terceiros).
- Segmentos públicos: `public, max-age=60`.

Se vier a existir conteúdo autenticado no futuro:
- Trocar para `private, no-store` em resposta a requests autenticados.
- Nunca compartilhar cache entre usuários.

---

## 7. Rate Limit

Não implementado a nível de aplicação. **Delegado ao edge (Cloudflare):**
- Regra recomendada: 300 req/min por IP no prefixo `/api/public/hls/`.
- WAF managed rules ativas.

Sinais de abuso a monitorar:
- Volume anormal de OPTIONS.
- IPs raspando manifest a cada segundo.
- User agents suspeitos consumindo segmentos sem fetch de manifest.

---

## 8. SSRF (Server-Side Request Forgery)

**Status atual: ✅ seguro por design.**

- `ORIGIN` é constante literal no código-fonte do proxy.
- O splat do path é apendado à URL fixa; o cliente **não** controla a URL upstream.
- Nenhum decode/redirect do path.

**⚠️ Nunca fazer:**
```ts
// PROIBIDO — SSRF
const url = request.url.searchParams.get("upstream")
await fetch(url)
```

Se no futuro múltiplas origens forem suportadas, usar allow-list explícita:
```ts
const PROVIDERS: Record<string, string> = { hls: "...", radio: "...", vod: "..." }
const upstream = PROVIDERS[params.provider]
if (!upstream) return new Response("Forbidden", { status: 403 })
```

---

## 9. Signed URLs (futuro)

Para conteúdo pago ou premium:
- Assinar URLs no servidor (HMAC + expiry + user-id).
- Validar no proxy antes de encaminhar ao origin.
- Origin também exige token para prevenir bypass.

---

## 10. DRM (futuro)

Roadmap V3:
- Widevine (Chrome/Edge/Firefox)
- FairPlay (Safari)
- PlayReady (Edge legacy)

Requer:
- License server (fora de escopo hoje).
- Manifestos com `EXT-X-KEY` + CDM (Content Decryption Module) do browser.
- Encrypted Media Extensions (EME) API — já suportada por `hls.js`.

Ver [ADR sobre DRM] (a criar quando priorizado).

---

## 11. Prevenção de abuso

| Vetor | Mitigação |
|---|---|
| Hotlinking | `Referer` check no proxy (opcional) + `frame-ancestors` CSP |
| Embed não-autorizado | `X-Frame-Options` / `frame-ancestors` |
| Scraping de manifestos | Rate limit no edge |
| DDoS | Cloudflare edge + Anycast |
| Content sniffing | `X-Content-Type-Options: nosniff` + MIME correto |
| MITM | HTTPS obrigatório + HSTS |

---

## 12. Checklist de review

Antes de mergear mudanças no proxy:

- [ ] `ORIGIN` continua constante fixa?
- [ ] Nenhum input do usuário é passado como URL para `fetch`?
- [ ] `Content-Type` continua sendo derivado por extensão?
- [ ] Nenhum header sensível é propagado indevidamente (ex.: `Set-Cookie`)?
- [ ] Preflight OPTIONS continua respondendo 204?
- [ ] Range continua sendo encaminhado?
