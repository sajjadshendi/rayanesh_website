<p align="center">
  <img src="public/images/rayanesh-logo.png" alt="Rayanesh magazine" width="180" />
</p>

<h1 align="center">Rayanesh</h1>

<p align="center">
  <strong>A home for science, culture and student voices.</strong><br />
  A Persian magazine website built with Astro, TypeScript and Markdown.
</p>

<p align="center">
  <a href="https://github.com/sajjadshendi/rayanesh_website/actions/workflows/ci.yml"><img src="https://github.com/sajjadshendi/rayanesh_website/actions/workflows/ci.yml/badge.svg?branch=main" alt="Validate magazine workflow status" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#project-map">Project map</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="SECURITY.md">Security</a>
</p>

---

## At a glance

Rayanesh is the science and culture magazine of the Computer Engineering Scientific Association at Sharif University of Technology. This repository contains its static website, editorial content and publication assets.

| Reading | Publishing | Engineering |
| --- | --- | --- |
| Persian, right-to-left layouts | Markdown articles and JSON metadata | Astro and TypeScript |
| Dark mode and text-size controls | Issues, authors and PDF archives | Static output for GitHub Pages |
| Search, math, code and footnotes | Optional audio, RSS and sitemap | Content validation and CI checks |

Content lives in Git. Pages, search data and feeds are generated at build time; no application server, database or public administration panel is required.

## Quick start

**Prerequisites:** Git and the Node.js version pinned in [.node-version](.node-version).

```sh
git clone https://github.com/sajjadshendi/rayanesh_website.git
cd rayanesh_website
npm ci
npm run dev
```

Open `http://localhost:4321`. To verify and preview the production build:

```sh
npm run validate
npm run preview
```

Hosting credentials are not needed for local development. For canonical URLs and feeds, provide `SITE_URL` as an environment variable before starting the build; [.env.example](.env.example) shows the expected format.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm test` | Test editorial rules, search and security boundaries |
| `npm run check` | Validate source content and check types |
| `npm run build` | Validate, build and verify `dist/` |
| `npm run validate` | Run tests and the complete build |
| `npm run preview` | Serve the completed build locally |
| `npm run new -- article my-article` | Create a draft article from a template |

The content tool also supports `author` and `issue`. See the [editorial workflow](CONTRIBUTING.md#editorial-content) before publishing.

## Project map

| Area | Entry point | Responsibility |
| --- | --- | --- |
| Editorial data | [src/content/](src/content/) | Articles, authors and magazine issues |
| Homepage | [src/data/site.json](src/data/site.json) | Featured content and site metadata |
| Pages | [src/pages/](src/pages/) | Routes, feeds, sitemap and search index |
| Shared UI | [src/components/](src/components/) · [src/layouts/](src/layouts/) | Reusable markup and page layout |
| Presentation | [src/styles/](src/styles/) · [src/scripts/](src/scripts/) | Styles and browser interactions |
| Content rules | [src/lib/](src/lib/) | Schemas, catalog, Markdown processing and search |
| Static assets | [public/](public/) | Covers, images and PDFs |
| Tooling | [scripts/](scripts/) · [tests/](tests/) | Content creation, validation and output checks |
| Templates | [docs/templates/](docs/templates/) | Inputs used by the content creation tool |
| Automation | [.github/workflows/ci.yml](.github/workflows/ci.yml) | Tests, build verification and dependency audit |

## Quality checks

The [Validate magazine workflow](.github/workflows/ci.yml) runs on pushes to `main` and pull requests:

- Tests for safe Markdown, Persian search and editorial relationships
- Schema and asset validation, followed by TypeScript checks
- Static build verification, including local links and draft exclusion
- Dependency auditing at the high-severity threshold

[Dependabot](.github/dependabot.yml) proposes dependency updates for review. For changes to UI or content, supplement automation with the relevant [review checks](CONTRIBUTING.md#review-expectations).

## Deployment

The deployment target is **GitHub Pages**, with [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). Tests, type checks, content validation, link verification and dependency auditing must succeed before the built artifact is deployed. Pushes to `main` publish automatically; the workflow also supports **Run workflow**.

### One-time migration settings

1. In Cloudflare **Workers & Pages → this Pages project → Settings → Builds / Branch control**, turn off **Enable automatic production branch deployments** and set **Preview branches** to **None**. Save both settings. Editing this repository alone does not disable Cloudflare's Git integration. Existing Cloudflare deployments remain available until you retire them.
2. In GitHub **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. A private repository requires a GitHub plan that supports Pages for private repositories (for this personal account, GitHub Pro). Do not change repository visibility just to enable deployment without reviewing the source/content disclosure.
3. Run **Deploy to GitHub Pages** from the Actions tab after saving the setting. Open the URL shown by its deployment job and check the homepage, a nested article, search and a PDF download.

Expected default address: https://sajjadshendi.github.io/rayanesh_website/

The deployment workflow obtains the origin and base path from GitHub Pages, so a configured custom domain is supported too. No personal access token or Cloudflare secret is required. Domain/DNS migration is separate; do not retire the old hosting until the new URL is verified.

### Local production checks

```sh
SITE_URL=https://sajjadshendi.github.io BASE_PATH=/rayanesh_website/ npm run validate
npm run preview
```

Open the preview at `/rayanesh_website/`. `SITE_URL` is an HTTPS origin without a path; `BASE_PATH` starts and ends with `/`. Without these values, local development uses `/` and remains non-indexable. CI checks both root and repository-subpath builds.

GitHub Pages does not interpret Cloudflare `_headers` or `_redirects`. The shared layout uses a meta Content Security Policy and referrer policy; header-only protections are documented in [SECURITY.md](SECURITY.md). The old `/topics/` route is handled by a static redirect. Arbitrary old `/topics/*` URLs fall back to the site's 404 page rather than a server-side wildcard redirect.

## Working together

- **Contribute:** [setup, editorial workflow and review expectations](CONTRIBUTING.md)
- **Report a bug:** use the bug report template in [Issues](https://github.com/sajjadshendi/rayanesh_website/issues/new/choose)
- **Suggest an improvement or content correction:** select the matching issue template
- **Report a security issue:** follow the private reporting guidance in [SECURITY.md](SECURITY.md)

## Credits and usage

Editorial texts, magazine PDFs, images and branding retain their respective owners' rights. Their inclusion here does not grant a general reuse license.

See [third-party notices](THIRD_PARTY_NOTICES.md) and the [bundled font licenses](docs/licenses/).
