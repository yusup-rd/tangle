# Tangle contributor instructions

These instructions apply throughout this repository.

## Stack and conventions

- Use the lockfile and `package.json` as the version reference. Read the relevant official documentation before changing Next.js, React, Prisma, Tailwind, or provider APIs.
- Use strict TypeScript. Avoid `any` and type-check suppressions. Define new components as arrow functions with block bodies and explicit returns. Put named props interfaces above the implementation and reuse shared data types.
- Use App Router conventions. Keep server-only work in server components, server actions, and route handlers. Validate inputs and enforce authorization at the server boundary.
- Use Tailwind utilities, CSS theme tokens in `src/app/globals.css`, and the shared Radix-based primitives. Preserve the system theme default and the user's explicit theme choice.
- Prefer parent `gap-*`, equal-dimension `size-*`, standard typography and responsive breakpoints, and numeric spacing utilities. Use `dvh` and `dvw` for viewport dimensions. Keep classes statically discoverable and let Prettier sort them.
- Keep nested rounded corners concentric. Set the outer radius to the inner radius plus the inset and outer border width.
- Keep keyboard and touch targets usable. Provide immediate press feedback, clear focus and status, and honor reduced motion, reduced transparency, and increased contrast.
- Reuse existing components and libraries. Remove dependencies and assets after their last use. Keep temporary scripts and screenshots outside the repo.

## Verification and deployment

- Use the workspace save settings for formatting and import cleanup. Husky runs lint-staged at commit time. Keep its Prettier, ESLint, Prettier order and support for partially staged changes.
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` for relevant changes. Run Playwright after auth, navigation, or UI changes and check both themes and viewport sizes.
- Preserve existing user, session, and media data during upgrades. Use a disposable development database and test accounts for write-path smoke tests. Check both old and new media URLs when changing uploads.
- Keep secrets in ignored environment files or Vercel. Update `.env.example` with variable names and safe defaults when configuration changes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
