# San3a Marketplace

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aahmedou838-cmyk/san3a-premium-service-marketplace)

## Overview

San3a Marketplace is a modern, full-stack web application built with Cloudflare Workers. It features a responsive React frontend with Tailwind CSS and shadcn/ui components, a Convex backend for real-time data and file storage, secure email-based authentication with OTP verification, and seamless API routing via Hono.

Key capabilities include user authentication (sign-up/sign-in with password + email OTP, password reset, anonymous login), file upload/download/delete with metadata storage, and a production-ready architecture optimized for edge deployment.

## Features

- **Secure Authentication**: Email/password with OTP verification, password reset, anonymous sessions, and Convex Auth integration.
- **File Management**: Upload, list, download, and delete user files with Convex Storage and metadata indexing.
- **Responsive UI**: shadcn/ui components, Tailwind CSS with custom themes, dark mode, sidebar navigation, and animations.
- **Real-time Backend**: Convex queries/mutations for authenticated file operations.
- **Edge-Optimized**: Cloudflare Workers for API routing, static asset serving, and CORS handling.
- **Developer Experience**: TypeScript end-to-end, Vite for fast HMR, Bun for installation/scripts, error reporting.
- **Multi-page Routing**: React Router with layout routes, error boundaries.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Framer Motion, Lucide Icons.
- **Backend**: Convex (queries, mutations, auth, storage), Hono (API routing).
- **Deployment**: Cloudflare Workers/Pages, Wrangler.
- **Auth**: Custom OTP email via Andromo SMTP, Password/Anonymous providers.
- **Other**: Immer, Zod, Sonner (toasts), Input-OTP, Sidebar components.

## Quick Start

### Prerequisites

- Bun 1.0+ installed (`curl -fsSL https://bun.sh/install | bash`)
- Cloudflare account and Wrangler CLI (`bunx wrangler@latest login`)
- Convex account (free tier available)
- Environment variables: `VITE_CONVEX_URL`, `ANDROMO_SMTP_URL`, `ANDROMO_SMTP_API_KEY`

### Installation

1. Clone the repository.
2. Install dependencies:
   ```
   bun install
   ```
3. Set up Convex backend:
   ```
   bunx convex dev --once
   ```
   - This initializes Convex schema and generates `convex.deploy/config.json`.
   - Add your SMTP env vars to Convex dashboard.

4. Configure frontend:
   - Create `.env` with `VITE_CONVEX_URL=<your-convex-url>` (from Convex dashboard).

### Development

- Start dev server (frontend + mocked backend):
  ```
  bun run dev
  ```
  - Access at `http://localhost:3000` (or `$PORT`).
- Lint codebase:
  ```
  bun run lint
  ```

### Usage Examples

- **Sign In/Sign Up**: Use `/` page with email/password + OTP.
- **File Operations** (extend `HomePage.tsx`):
  ```tsx
  // Example: Upload file
  const { generateUploadUrl } = useMutation(api.files.generateUploadUrl);
  const url = await generateUploadUrl();
  // Upload to url, then saveMetadata

  // List files
  const files = useQuery(api.files.listFiles);
  ```
- **API Routes**: Extend `worker/userRoutes.ts` for custom endpoints (e.g., `/api/files`).
- **Theme Toggle**: Built-in dark/light mode.
- **Error Reporting**: Automatic client errors logged to `/api/client-errors`.

## Deployment

Deploy to Cloudflare Workers in one command:

```
bun run deploy
```

This:
- Deploys Convex backend: `bun run backend:deploy`
- Builds frontend: `vite build`
- Deploys Worker + assets via Wrangler.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aahmedou838-cmyk/san3a-premium-service-marketplace)

### Post-Deployment

- Bind `ASSETS` in Wrangler dashboard (auto-configured).
- Set Convex production URL in `VITE_CONVEX_URL`.
- Custom domain via Cloudflare Pages/Workers.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CONVEX_URL` | Convex deployment URL | Frontend |
| `ANDROMO_SMTP_URL` | SMTP service base URL | Backend (Convex) |
| `ANDROMO_SMTP_API_KEY` | SMTP API key | Backend (Convex) |
| `CONVEX_SITE_URL` | Frontend base URL | Backend (Convex Auth) |

## Project Structure

```
├── convex/          # Backend: Schema, auth, files.ts
├── src/             # Frontend: React app, components, pages
├── worker/          # Cloudflare Worker: Hono API routes
├── shared/          # Shared types/utils
└── package.json     # Bun scripts, deps
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Local dev server |
| `bun run build` | Build for production |
| `bun run deploy` | Full deploy (Convex + Worker) |
| `bun run backend:deploy` | Deploy Convex only |
| `bun run lint` | ESLint check |

## Contributing

1. Fork and clone.
2. `bun install && bun run dev`.
3. Make changes, lint, test locally.
4. PR with clear description.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Support

- [Convex Docs](https://docs.convex.dev)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers)
- Issues: GitHub repository

Built with ❤️ by Andromo.