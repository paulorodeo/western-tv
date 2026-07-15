import { createFileRoute } from "@tanstack/react-router";
import { LivePlayer } from "@/components/LivePlayer";
import heroImg from "@/assets/hero-cowboy.jpg";
import ecoPortal from "@/assets/eco-portal.jpg";
import ecoRadio from "@/assets/eco-radio.jpg";
import ecoTv from "@/assets/eco-tv.jpg";
import poweredLogo from "@/assets/powered-pr.webp.asset.json";

const LOGO = "https://agronejo.fazenda.rodeo/wp-content/uploads/2025/01/New-Logo-Fazenda-Rodeo-180-x-56-px1.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:image", content: "https://agronejo.fazenda.rodeo/wp-content/uploads/2025/01/New-Logo-Fazenda-Rodeo-180-x-56-px1.png" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TelevisionStation",
          name: "Fazenda Rodeo TV",
          url: "https://tv.fazenda.rodeo",
          logo: LOGO,
          description: "Emissora premium dedicada ao universo country, western e agro.",
          sameAs: ["https://country.fazenda.rodeo", "https://country.fazenda.rodeo/player"],
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <a href="/" className="flex items-center gap-3">
            <img src={LOGO} alt="Fazenda Rodeo" className="h-8 w-auto" />
          </a>
          <nav className="hidden items-center gap-10 text-[11px] tracking-[0.28em] uppercase text-muted-foreground md:flex">
            <a href="#ao-vivo" className="transition-colors hover:text-gold">Ao vivo</a>
            <a href="#historia" className="transition-colors hover:text-gold">História</a>
            <a href="#ecossistema" className="transition-colors hover:text-gold">Ecossistema</a>
            <a href="https://paulo.fazenda.rodeo" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">Universo</a>
          </nav>
          <a
            href="#ao-vivo"
            className="rounded-sm border border-gold/40 px-4 py-2 text-[10px] tracking-[0.28em] uppercase text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            Assistir
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Cavaleiro ao entardecer no rancho"
            width={1920}
            height={1080}
            className="h-full w-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pt-32 pb-20 sm:px-10">
          <div className="max-w-2xl animate-fade">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-live" />
              <span className="eyebrow">Transmitindo agora · 24h</span>
            </div>
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              A alma do <span className="text-gold italic">country</span><br/>em tempo real.
            </h1>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Uma emissora dedicada ao universo western — conectando os ranchos do Brasil e dos Estados Unidos, do rodeio à música, do agro à tradição.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#ao-vivo"
                className="group inline-flex items-center gap-3 rounded-sm bg-gold px-7 py-4 text-[11px] tracking-[0.32em] uppercase text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Assistir ao vivo
              </a>
              <a
                href="https://fazenda.rodeo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] tracking-[0.32em] uppercase text-foreground/70 transition-colors hover:text-gold"
              >
                Conheça a marca →
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-muted-foreground/60">
          Fazenda Rodeo · Est. Brasil × EUA
        </div>
      </section>

      {/* Player */}
      <section id="ao-vivo" className="relative border-t border-white/5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Canal 01 · Ao vivo</p>
              <h2 className="mt-4 font-display text-4xl text-foreground sm:text-5xl md:text-6xl">
                A transmissão está no ar.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Programação contínua de rodeios, documentários, música e cultura western. Sem interrupções, em alta definição.
            </p>
          </div>
          <LivePlayer />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[10px] tracking-[0.28em] uppercase text-muted-foreground">
            <span>Signal · HLS 1080p</span>
            <span>Direto do estúdio Fazenda Rodeo</span>
          </div>
        </div>
      </section>

      {/* História */}
      <section id="historia" className="relative overflow-hidden border-t border-white/5 py-28 sm:py-40">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow">A marca</p>
              <div className="mt-6 hairline w-24" />
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl">
                Entre o cerrado goiano e as planícies do Texas — <span className="text-gold italic">uma só tradição.</span>
              </h2>
              <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted-foreground">
                <p>
                  A Fazenda Rodeo nasceu da convicção de que o universo country é maior que fronteiras. Somos a ponte entre a cultura western brasileira e norte-americana — do rodeio de Barretos às arenas de Nashville, dos ranchos de Montana às fazendas de Goiás.
                </p>
                <p>
                  Aqui, música, agronegócio, turismo rural e documentários ganham um mesmo palco: uma emissora contemporânea que honra a tradição sem abrir mão da elegância.
                </p>
              </div>
              <dl className="mt-14 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Sinal</dt>
                  <dd className="mt-2 font-display text-3xl text-gold">24h</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Países</dt>
                  <dd className="mt-2 font-display text-3xl text-gold">BR · US</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Estilo</dt>
                  <dd className="mt-2 font-display text-3xl text-gold">Western</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Ecossistema */}
      <section id="ecossistema" className="relative border-t border-white/5 py-28 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-20 text-center">
            <p className="eyebrow">Ecossistema Fazenda Rodeo</p>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl">
              Três plataformas. Uma única <span className="italic text-gold">essência country.</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Portal", tag: "Notícias & Cultura", desc: "O jornalismo, os artistas e as histórias que movem o universo agro e western.", href: "https://country.fazenda.rodeo", img: ecoPortal },
              { title: "Rádio Country", tag: "Áudio 24h", desc: "A trilha sonora do rancho. Clássicos e novidades da música country em fluxo contínuo.", href: "https://country.fazenda.rodeo/player", img: ecoRadio },
              { title: "TV", tag: "Streaming ao vivo", desc: "Rodeios, documentários e programação exclusiva em alta definição, direto no ar.", href: "https://tv.fazenda.rodeo", img: ecoTv },
            ].map((c) => (
              <a
                key={c.title}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-[520px] flex-col justify-end overflow-hidden rounded-lg border border-white/10 bg-card"
              >
                <img
                  src={c.img}
                  alt={c.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="relative z-10 p-8">
                  <p className="text-[10px] tracking-[0.32em] uppercase text-gold">{c.tag}</p>
                  <h3 className="mt-4 font-display text-4xl text-white">{c.title}</h3>
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{c.desc}</p>
                  <div className="mt-8 inline-flex items-center gap-2 text-[10px] tracking-[0.32em] uppercase text-white transition-colors group-hover:text-gold">
                    Acessar
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-onyx py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-left">
              <img src={LOGO} alt="Fazenda Rodeo" className="mx-auto h-8 w-auto md:mx-0" />
              <p className="mt-5 max-w-xs text-sm text-muted-foreground">
                A emissora premium da cultura country. Conectando Brasil e Estados Unidos, 24 horas por dia.
              </p>
            </div>

            <nav className="flex flex-col items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-muted-foreground md:items-end">
              <a href="https://country.fazenda.rodeo" className="hover:text-gold">Portal</a>
              <a href="https://country.fazenda.rodeo/player" className="hover:text-gold">Rádio</a>
              <a href="https://tv.fazenda.rodeo" className="hover:text-gold">TV</a>
            </nav>
          </div>

          <div className="mt-12 hairline" />

          <div className="mt-8 flex flex-col items-center justify-between gap-6 text-[10px] tracking-[0.28em] uppercase text-muted-foreground md:flex-row">
            <p>© {new Date().getFullYear()} Fazenda Rodeo · Todos os direitos reservados</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="https://www.instagram.com/rodeocountrymedia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gold">Instagram</a>
              <a href="https://www.youtube.com/@fazendarodeo" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-gold">YouTube</a>
              <a href="https://www.facebook.com/paulorodeoagro" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gold">Facebook</a>
              <a href="https://wa.me/5511988559044" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-gold">WhatsApp</a>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href="https://paulo.rodeo"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-muted-foreground/70 transition-colors hover:text-gold"
            >
              <span>Powered by</span>
              <img src={poweredLogo.url} alt="Paulo Rodeo" className="h-6 w-auto opacity-70 transition-opacity group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
