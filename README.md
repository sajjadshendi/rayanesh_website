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
| Dark mode and text-size controls | Issues, authors and PDF archives | Static output for Cloudflare Pages |
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

Cloudflare credentials are not needed for local development. For canonical URLs and feeds, provide `SITE_URL` as an environment variable before starting the build; [.env.example](.env.example) shows the expected format.

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
| Static assets | [public/](public/) | Covers, images, PDFs and response headers |
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

The deployment target is **Cloudflare Pages**, using its Git integration.

<details>
<summary><strong>Build settings and environment</strong></summary>

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `Astro` |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Root directory | Repository root |
| `NODE_VERSION` | Match [.node-version](.node-version) |
| `SKIP_DEPENDENCY_INSTALL` | `1` |
| `ASTRO_TELEMETRY_DISABLED` | `1` |
| `SITE_URL` | Production HTTPS origin; no path, query or fragment |

Install development dependencies during the build; they include required validation tools. Set the final production origin explicitly for canonical URLs and feeds. Configuration falls back to `CF_PAGES_URL` when available.

This static Pages setup does not need a Worker deployment command or Cloudflare API tokens in GitHub.

</details>

Pages deployment and GitHub Actions run independently. Review successful checks before merging into `main`; CI alone does not block a Pages deployment.

## Working together

- **Contribute:** [setup, editorial workflow and review expectations](CONTRIBUTING.md)
- **Report a bug:** use the bug report template in [Issues](https://github.com/sajjadshendi/rayanesh_website/issues/new/choose)
- **Suggest an improvement or content correction:** select the matching issue template
- **Report a security issue:** follow the private reporting guidance in [SECURITY.md](SECURITY.md)

## Credits and usage

Editorial texts, magazine PDFs, images and branding retain their respective owners' rights. Their inclusion here does not grant a general reuse license.

See [third-party notices](THIRD_PARTY_NOTICES.md) and the [bundled font licenses](docs/licenses/).
