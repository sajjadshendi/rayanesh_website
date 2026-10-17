# Security

## Reporting a vulnerability

Report suspected vulnerabilities privately to the repository owner using your established project contact channel. If the repository offers GitHub's **Report a vulnerability** option, you can use that instead. Do not publish credentials, personal data or exploit details in an issue.

Include the affected commit, reproduction steps and likely impact. Redact sensitive values from logs and screenshots.

## Project boundaries

Rayanesh generates static pages. It has no visitor accounts, database or application server. Its security depends on the build toolchain, dependencies, hosting and repository access, and the files approved for publication.

- Markdown processing rejects raw HTML, unsafe links and remote images.
- Content schemas and build checks validate references, assets and draft publication boundaries.
- KaTeX runs with trusted commands disabled.
- GitHub Pages does not support custom response headers. The shared layout supplies a meta Content Security Policy and referrer policy. Header-only protections (including frame-ancestors, X-Frame-Options, Permissions-Policy and cross-origin isolation) require a hosting proxy; they are not provided by this deployment.
- Build checks do not scan PDFs for malware or constitute a full security audit.

## Publishing and maintenance

- Treat everything in `public/` as public after deployment, even when its article or issue is a draft.
- A private repository or a `noindex` directive does not restrict access to deployed pages.
- Keep secrets out of commits, logs and browser-exposed configuration.
- Use multi-factor authentication and limit repository and hosting access to the roles needed.
- Review dependency updates with the lockfile and run `npm run validate` and `npm audit --audit-level=high`.
- Review successful checks before merging: Pages Git integration deploys independently of GitHub Actions.

If a credential is exposed, revoke or rotate it at its provider first, then review access and deployment logs. Removing a file does not invalidate credentials or remove earlier deployments.
