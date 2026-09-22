# Contributing to Rayanesh

Thanks for helping maintain the magazine. Keep each contribution focused so that its purpose, implementation and validation are easy to review.

[Project overview](README.md) · [Security reporting](SECURITY.md) · [Third-party notices](THIRD_PARTY_NOTICES.md)

## Before you start

Search existing issues and pull requests. For a substantial feature, describe the reader or editor problem in an issue before starting implementation. Use the dedicated templates for bugs, improvements and content corrections.

The site is Persian and right-to-left; repository documentation and collaboration templates are in English.

## Development workflow

1. Create a branch from the latest `main`, such as `fix/search-query` or `docs/setup`.
2. Use the Node.js version in [.node-version](.node-version) and install with `npm ci`.
3. Make a focused change, matching the surrounding code.
4. Run the checks relevant to the change using the table below.
5. Open a pull request explaining the problem, the change and the evidence.
6. Review successful CI checks and the preview, when available, before merging.

[.editorconfig](.editorconfig) defines shared text-file defaults. Avoid unrelated formatting changes. Never commit secrets, generated `dist/` output or `node_modules/`.

## Review expectations

| Change | Verification |
| --- | --- |
| Code, content or build configuration | `npm run validate` |
| Dependencies | `npm run validate`, `npm audit --audit-level=high`, and the matching lockfile |
| Layout or browser behavior | Validation plus desktop/mobile, RTL, keyboard and relevant reading/search checks |
| Article or issue content | Validation plus source attribution, PDF references and publication permissions |
| Documentation or repository templates | Check links, commands and template structure; no new application tests needed |

Include screenshots for visual changes. State any checks you could not run and why. The pull request template provides a short structure; remove sections that do not apply.

Use descriptive commit subjects, for example `fix: handle empty search queries` or `docs: clarify local setup`.

## Editorial content

| Content | Location |
| --- | --- |
| Articles | `src/content/articles/*.md` |
| Authors | `src/content/authors/*.json` |
| Issues | `src/content/issues/*.json` |
| Homepage selections | `src/data/site.json` |
| Covers, images, PDFs and audio | Appropriate directories under `public/` |

Create content using the existing templates (article and issue templates start as drafts):

```sh
npm run new -- article my-article
npm run new -- author author-name
npm run new -- issue issue-slug
```

The tool creates a new file without overwriting an existing one. Replace all sample metadata before publishing. File names are stable identifiers and form part of page URLs; use lowercase English slugs with hyphens.

Articles use Markdown with YAML frontmatter. Authors and issues use JSON. The [content schemas](src/lib/content-schema.mjs) define accepted fields; use existing entries as examples.

- Keep articles and issues as drafts until reviewed.
- Link articles to valid author and issue identifiers.
- Match PDF page references to physical PDF pages and `pdfBytes` to the actual file size.
- Provide descriptive image alternative text and local image assets.
- Use Markdown; raw HTML, unsafe URL schemes and remote Markdown images are rejected.
- Preserve attribution and distinguish full articles from excerpts.
- Run `npm run validate` before submitting content.

All assets in `public/` are public after deployment, including assets associated with drafts. Only add material approved for publication. The printed PDF remains the reference when reviewing article transcriptions.

## Security and rights

Follow [SECURITY.md](SECURITY.md) for private vulnerability reporting. Review [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) before reusing or contributing third-party materials.
