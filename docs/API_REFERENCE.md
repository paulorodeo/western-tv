# API Reference — Player Endpoints

> Contrato completo dos endpoints usados pelos players.
> Implementação: [`src/routes/api/public/hls.$.ts`](../src/routes/api/public/hls.$.ts), [`src/routes/api/public/radio.$.ts`](../src/routes/api/public/radio.$.ts).

---

## Índice

- [`/api/public/hls/*`](#apipublichls) — proxy HLS de vídeo (TV)
- [`/api/public/radio/*`](#apipublicradio) — proxy HLS de áudio (Rádio)
- [Regras compartilhadas](#regras-compartilhadas)

---

## `/api/public/hls/*`

**Finalidade:** Proxy same-origin para o servidor HLS `https://tv.fazenda.rodeo/hls/`. Corrige CORS ausente e MIME incorreto do upstream. Encaminha Range requests.

### Métodos suportados

| Método | Status esperado | Uso |
|---|---|---|
| `OPTIONS` | 204 | Preflight CORS |
| `GET` | 200 / 206 | Buscar manifesto ou segmento |
| `HEAD` | 200 / 206 | Metadados sem body |

### Parâmetros

**Path (splat):** tudo após `/api/public/hls/`.

| Exemplo path | Upstream resultante |
|---|---|
| `live.m3u8` | `https://tv.fazenda.rodeo/hls/live.m3u8` |
| `seg-2024-07-18-00001.ts` | `https://tv.fazenda.rodeo/hls/seg-2024-07-18-00001.ts` |
| `variant/720p.m3u8` | `https://tv.fazenda.rodeo/hls/variant/720p.m3u8` |

### Request headers aceitos

| Header | Descrição |
|---|---|
| `Range` | Encaminhado ao upstream. Ex: `bytes=0-1023` |
| `Origin` | Usado pelo browser para CORS; qualquer origem é aceita |

### Response headers retornados

| Header | Valor |
|---|---|
| `Content-Type` | Corrigido por extensão (ver tabela abaixo). Nunca `application/octet-stream` para `.m3u8`/`.ts`. |
| `Content-Length` | Do upstream, se presente |
| `Content-Range` | Do upstream, em respostas 206 |
| `Accept-Ranges` | Do upstream |
| `Cache-Control` | Do upstream, ou default: `no-cache` (`.m3u8`) / `public, max-age=60` (outros) |
| `ETag` | Do upstream, se presente |
| `Last-Modified` | Do upstream, se presente |
| `Access-Control-Allow-Origin` | `*` |
| `Access-Control-Allow-Methods` | `GET, HEAD, OPTIONS` |
| `Access-Control-Allow-Headers` | `Range, Content-Type` |
| `Access-Control-Expose-Headers` | `Content-Length, Content-Range, Accept-Ranges` |

### Content-Type por extensão

| Extensão | Content-Type |
|---|---|
| `.m3u8` | `application/vnd.apple.mpegurl` |
| `.ts` | `video/mp2t` |
| `.m4s` | `video/mp4` |
| `.mp4` | `video/mp4` |
| `.key` | `application/octet-stream` |
| outros | do upstream, ou `application/octet-stream` |

### Códigos HTTP

| Código | Significado |
|---|---|
| 200 | OK — manifesto ou segmento completo |
| 204 | Preflight OPTIONS bem-sucedido |
| 206 | Partial Content — resposta a Range |
| 404 | Segmento/manifesto não existe no upstream |
| 5xx | Falha do upstream (propagada) |

### Exemplos

**Preflight:**
```bash
curl -i -X OPTIONS https://exemplo.com/api/public/hls/live.m3u8 \
  -H "Origin: https://outro.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Range"
```
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Range, Content-Type
Access-Control-Max-Age: 86400
```

**Manifesto:**
```bash
curl -i https://exemplo.com/api/public/hls/live.m3u8
```
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.apple.mpegurl
Cache-Control: no-cache
Access-Control-Allow-Origin: *

#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXTINF:6.000,
seg1.ts
...
```

**Segmento com Range:**
```bash
curl -i https://exemplo.com/api/public/hls/seg1.ts -H "Range: bytes=0-1023"
```
```http
HTTP/1.1 206 Partial Content
Content-Type: video/mp2t
Content-Range: bytes 0-1023/188416
Content-Length: 1024
Accept-Ranges: bytes
Cache-Control: public, max-age=60
Access-Control-Allow-Origin: *

<binary MPEG-TS>
```

---

## `/api/public/radio/*`

**Finalidade:** Idem ao HLS, apontando para `https://live.fazenda.rodeo/hls/country/`. Estrutura idêntica; único diferencial é o suporte a `.aac`.

### Content-Type por extensão

| Extensão | Content-Type |
|---|---|
| `.m3u8` | `application/vnd.apple.mpegurl` |
| `.ts` | `video/mp2t` |
| `.aac` | `audio/aac` |
| `.m4s` / `.mp4` | `video/mp4` |

Todos os outros aspectos (métodos, códigos, cache, CORS) são idênticos a `/api/public/hls/*`.

---

## Regras compartilhadas

### Cache

| Recurso | Default |
|---|---|
| Manifesto (`.m3u8`) | `no-cache` — muda continuamente na janela deslizante |
| Segmento (`.ts`, `.m4s`, `.aac`) | `public, max-age=60` — imutável dentro da janela |
| Header `Cache-Control` do upstream | Sempre preservado se presente |

### Streaming

O proxy **não bufferiza**. Passa `upstream.body` (ReadableStream) diretamente ao cliente. Consumo de memória é ~O(1) independente do tamanho do segmento.

### CORS

- `Access-Control-Allow-Origin: *` — os endpoints são públicos e servem conteúdo destinado a qualquer origem (embed, whitelabel).
- Preflight cached por 24h (`Access-Control-Max-Age: 86400`).

### Segurança

- Origin upstream é constante fixa no código. **URL do cliente nunca é usada para escolher upstream.** Isso previne SSRF.
- Ver [`SECURITY.md`](./SECURITY.md) para detalhes.

### Rate limit

Não aplicado a nível de aplicação. Fica a cargo do edge (Cloudflare). Ver [`SECURITY.md § Rate Limit`](./SECURITY.md).
