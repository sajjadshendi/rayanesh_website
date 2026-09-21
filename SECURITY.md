# Security

## Reporting a vulnerability

Report security issues privately to the repository owner through an established private contact channel. If GitHub private vulnerability reporting is available for this repository, use it. Do not post credentials, personal data or exploitable details in public issues.

Include the affected revision, reproduction steps, impact and a suggested fix when available. No response-time commitment or separate release support policy is currently defined.

## Security boundaries

The site generates static output. It has no visitor accounts, database or application server. Security still depends on the build toolchain, repository and hosting accounts, dependencies and published assets.

- Editorial Markdown rejects raw HTML, unsafe links and remote images.
- Content schemas and build checks validate references, assets and draft publication boundaries.
- KaTeX runs without trusted commands.
- Security headers are configured in `public/_headers`; verify them on the deployed site because local preview does not apply Cloudflare headers.
- Fonts are bundled locally. Browser scripts are restricted by the Content Security Policy.
- Tests and build checks do not replace an independent security review or malware scanning of uploaded PDFs.

## Maintenance and publishing

- Use `npm ci`, review dependency updates and run `npm run validate` and `npm audit --audit-level=high`.
- Protect GitHub and Cloudflare accounts with multi-factor authentication and limit access to required repositories and roles.
- Review pull requests and successful checks before merging. Pages deployment does not automatically wait for GitHub Actions.
- Treat every file in `public/` as publicly accessible. Draft flags do not protect assets.
- Private repository visibility and preview `noindex` directives do not provide access control for deployed sites.
- Never commit secrets or put them in browser-exposed configuration.

If a credential is exposed, revoke or rotate it at its provider first, then review access and deployment logs. Removing a file or rewriting Git history does not invalidate a credential or remove earlier deployments.
