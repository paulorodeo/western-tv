import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import faviconAsset from "../assets/favicon.webp.asset.json";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl text-foreground">Página não encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          O caminho que você procura não existe mais neste rancho.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm border border-gold/40 px-6 py-3 text-xs tracking-[0.28em] uppercase text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Sinal perdido</p>
        <h1 className="mt-4 text-3xl text-foreground">Esta transmissão falhou</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tente novamente em instantes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-sm bg-gold px-6 py-3 text-xs tracking-[0.28em] uppercase text-primary-foreground hover:opacity-90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="rounded-sm border border-white/15 px-6 py-3 text-xs tracking-[0.28em] uppercase text-foreground hover:bg-white/5"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fazenda Rodeo TV — Cultura Country ao Vivo" },
      { name: "description", content: "A emissora premium do universo country, western e agro. Assista à Fazenda Rodeo TV ao vivo, conectando Brasil e Estados Unidos." },
      { name: "author", content: "Fazenda Rodeo" },
      { name: "theme-color", content: "#0d0b09" },
      { property: "og:title", content: "Fazenda Rodeo TV — Cultura Country ao Vivo" },
      { property: "og:description", content: "A emissora premium do universo country, western e agro. Assista à Fazenda Rodeo TV ao vivo, conectando Brasil e Estados Unidos." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Fazenda Rodeo TV" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Fazenda Rodeo TV — Cultura Country ao Vivo" },
      { name: "twitter:description", content: "A emissora premium do universo country, western e agro. Assista à Fazenda Rodeo TV ao vivo, conectando Brasil e Estados Unidos." },
      { property: "og:image", content: "https://agronejo.fazenda.rodeo/wp-content/uploads/2025/01/New-Logo-Fazenda-Rodeo-180-x-56-px1.png" },
      { name: "twitter:image", content: "https://agronejo.fazenda.rodeo/wp-content/uploads/2025/01/New-Logo-Fazenda-Rodeo-180-x-56-px1.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
