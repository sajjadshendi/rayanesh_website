# Rayanesh

A Persian science and culture magazine website built with Astro, TypeScript and Markdown. It generates a static site for Cloudflare Pages.

## Features

- Responsive right-to-left layouts and locally bundled fonts
- Magazine issues, PDF archives, articles, authors and topic pages
- Client-side Persian search, dark mode and reading controls
- Math, code blocks, tables, footnotes and optional audio
- RSS, sitemap and build-time content validation

Content is maintained in the repository. There is no application server, database or public administration panel.

## Quick start

Use the Node.js version in [.node-version](.node-version).

```sh
git clone https://github.com/sajjadshendi/rayanesh_website.git
cd rayanesh_website
npm ci
npm run dev
```

The development server is available at `http://localhost:4321`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run content and security boundary tests |
| `npm run check` | Validate content and check types |
| `npm run build` | Check, build and verify the static output |
| `npm run validate` | Run tests and the complete build |
| `npm run preview` | Preview a completed build |

## Project structure

| Path | Contents |
| --- | --- |
| `src/content/` | Articles, authors and magazine issues |
| `src/data/site.json` | Homepage selections and site metadata |
| `src/pages/`, `src/layouts/`, `src/components/` | Astro pages and shared UI |
| `src/styles/`, `src/scripts/` | Styles and browser behavior |
| `public/` | Published images, PDFs, audio and security headers |
| `scripts/`, `tests/` | Content tools and validation |
| `docs/templates/` | Templates required by the content creation tool |

## Deployment

Use the Cloudflare **Pages** Git integration with these project settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `Astro` |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Root directory | Repository root |
| `NODE_VERSION` | Match `.node-version` |
| `SKIP_DEPENDENCY_INSTALL` | `1` |
| `ASTRO_TELEMETRY_DISABLED` | `1` |
| `SITE_URL` | The production HTTPS origin, with no path, query or fragment |

Install development dependencies during the build; they include required validation tools. Set the final production origin explicitly for canonical URLs and feeds. The configuration falls back to `CF_PAGES_URL` when available.

This project uses Pages static hosting and does not require a Worker deployment command or Cloudflare API tokens in GitHub.

The `Validate magazine` workflow runs tests, builds the site and audits dependencies. Pages Git integration deploys independently of GitHub Actions; review successful checks before merging.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution and content workflow, and [SECURITY.md](SECURITY.md) for security reporting and deployment boundaries.

## Third-party materials

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [font licenses](docs/licenses/). No general reuse license is granted for the magazine's editorial texts, PDFs, images or branding.
