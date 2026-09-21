# Contributing

Keep changes focused and describe their purpose and validation in a pull request.

## Development workflow

1. Create a branch from the latest `main`.
2. Use the Node.js version in `.node-version` and install dependencies with `npm ci`.
3. Make the change and run `npm run validate`.
4. For dependency changes, also run `npm audit --audit-level=high` and commit the matching lockfile.
5. Review the local preview, including mobile layouts and right-to-left text when relevant.
6. Open a pull request and wait for successful checks before merging.

Do not commit secrets, generated `dist/` output or `node_modules/`.

## Editorial content

| Content | Location |
| --- | --- |
| Articles | `src/content/articles/*.md` |
| Authors | `src/content/authors/*.json` |
| Issues | `src/content/issues/*.json` |
| Homepage selections | `src/data/site.json` |
| Covers, images, PDFs and audio | Appropriate directories under `public/` |

Create a draft using the existing templates:

```sh
npm run new -- article my-article
npm run new -- author author-name
npm run new -- issue issue-slug
```

Replace all sample metadata before publishing. File names are stable identifiers and form part of page URLs; use lowercase English slugs with hyphens.

Articles use Markdown with YAML frontmatter. Authors and issues use JSON. The schemas in `src/lib/content-schema.mjs` define accepted fields. Use existing entries as examples.

- Keep articles and issues as drafts until reviewed.
- Link articles to valid author and issue identifiers.
- Match PDF page references to physical PDF pages and `pdfBytes` to the actual file size.
- Provide descriptive image alternative text and local image assets.
- Use Markdown; raw HTML, active links and remote Markdown images are rejected.
- Run `npm run validate` before submitting content.

All assets in `public/` are public after deployment, including assets associated with drafts. Only add material approved for publication.

## Review

For UI changes, include screenshots and check keyboard navigation, mobile layouts, Persian text, search and reading controls as applicable. Keep article transcription faithful to the source PDF and confirm attribution and permissions for contributed materials.
