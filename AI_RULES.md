# AI Rules — Cambridge Hub Study App

## Tech Stack

- **Framework:** React 18 with Vite (standard `@vitejs/plugin-react` setup — no proprietary build plugins). No SSR. All source code lives in `src/`. Path alias `@/` maps to `src/` via `vite.config.js`.
- **Language:** JavaScript (`.jsx` / `.js`). TypeScript is present but only used in `src/utils/index.ts` and type-checking via `jsconfig.json`; new files should use `.jsx`/`.js` to match the existing codebase.
- **Routing:** React Router v6 (`react-router-dom`). All routes are declared in `src/App.jsx`. Pages go in `src/pages/`, sub-topic pages in `src/pages/<topic>/`.
- **Styling:** Tailwind CSS v3 with CSS variables for theming (dark `#0d0d1a` base). Use Tailwind classes for all layout, spacing, color, and typography. Never use inline styles except for dynamic values (e.g. animated transforms).
- **UI Components:** shadcn/ui (New York style, neutral base) with Radix UI primitives. Pre-built components live in `src/components/ui/` — do not edit them; create new components that wrap them if customisation is needed.
- **Icons:** `lucide-react` exclusively. Do not import icons from any other library.
- **Backend / Data:** `@base44/sdk` (`src/api/base44Client.js`). All entity reads/writes go through `base44.entities.*`. Auth is handled via `base44.auth.*` and the `AuthProvider` in `src/lib/AuthContext.jsx`.
- **Student data layer:** `src/lib/topicStore.js` (Physics) and `src/lib/csTopicStore.js` (CS) are the single source of truth for all student progress. Always use their exported async functions; never read/write `StudentData` entities directly from a page.
- **Server-side queries / caching:** `@tanstack/react-query` (client instance at `src/lib/query-client.js`). Use `useQuery` / `useMutation` for any async data that needs caching or refetch behaviour.

## Library Usage Rules

| Use case | Library to use |
|---|---|
| UI primitives (buttons, dialogs, tabs, etc.) | `shadcn/ui` components from `@/components/ui/` |
| Icons | `lucide-react` only |
| Animations / transitions | Tailwind `animate-*` classes first; use `framer-motion` only for complex gesture-driven or keyframe animations |
| Forms + validation | `react-hook-form` + `zod` (resolvers via `@hookform/resolvers`) |
| Date formatting | `date-fns` (preferred) or `moment` (already used in places — avoid adding new `moment` usage) |
| Charts / graphs | `recharts` |
| Drag and drop | `@hello-pangea/dnd` |
| Markdown rendering | `react-markdown` |
| Toast notifications | `sonner` (via `src/components/ui/sonner.jsx`) — do **not** use `react-hot-toast` |
| PDF export | `jspdf` + `html2canvas` (see `src/lib/generatePdf.js`) |
| Utility functions | `lodash` for data manipulation; `clsx` + `tailwind-merge` (via `src/lib/utils.js` `cn()`) for class merging |
| Path aliases | Use `@/` for `src/` (e.g. `@/components/ui/button`) |

## Project Conventions

- **Routes stay in `src/App.jsx`.** Always add new routes there; never create a separate router file.
- **Wrap all authenticated pages in `<AppLayout />`** (already the outer `<Route>` in `App.jsx`).
- **Student progress mutations** must go through `topicStore.js` / `csTopicStore.js` helper functions, not raw SDK calls.
- **Dark theme only.** The app uses a dark `#0d0d1a` background with white/opacity text. Do not add light-mode styles or `next-themes` toggles.
- **Mobile-first layout.** Max content width is `max-w-[540px] mx-auto`. Prefer `px-4` horizontal padding on page containers.
- **Do not install new packages** without a clear reason — check the existing dependency list first; the required library is likely already present.

<!-- nitro:start -->

## Nitro Server Layer

This project has a Nitro server layer for backend API routes. A `nitro.config.ts` at the app root sets `serverDir: "./server"` — do not move or remove it.

### vite.config.ts

`vite.config.ts` already imports `nitro` from `"nitro/vite"` and registers `nitro()` as the LAST entry in the `plugins` array. Do not move it earlier — it must run after Vite's module-transform middleware, otherwise Nitro's SPA fallback intercepts Vite internal URLs (`/src/*.tsx`, `/@vite/client`, `/@react-refresh`, `/@fs/*`) and returns `index.html`, breaking the preview.

### API Route Conventions

- Write routes in `server/routes/api/` (NEVER top-level `/api/`).
- Dynamic routes: `[param].ts`. Method-specific: `hello.get.ts`, `hello.post.ts`.
- Runtime config: `useRuntimeConfig()` (env vars prefixed with `NITRO_`).

### Imports — read carefully

Imports come from two different sources:

- `defineHandler` and `useRuntimeConfig` are imported from **`"nitro"`**.
- **Every request/response helper comes from `"nitro/h3"`** — Nitro v3 re-exports h3 utilities through that subpath. Common ones: `readBody`, `readValidatedBody`, `getQuery`, `getRouterParam`, `getRouterParams`, `createError`, `sendError`, `setResponseStatus`, `getRequestHeaders`, `getRequestURL`, `setCookie`, `getCookie`, `deleteCookie`.

Worked example — `server/routes/api/todos.post.ts`:

```ts
import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string }>(event);
  if (!body?.title) {
    throw createError({ statusCode: 400, statusMessage: "title is required" });
  }
  return { ok: true, title: body.title };
});
```

### Server-side packages

Any package used inside `server/` (database drivers like `@neondatabase/serverless`, auth SDKs, third-party API clients) must be in `package.json`. Add it before writing the first server file that imports it. NEVER import these from `src/` — code under `src/` ships to the browser, so importing server packages there leaks them and usually breaks the build.

### Common mistakes

- `import { readBody } from "nitro"` → wrong. h3 utilities are not exported from `"nitro"`. Use `"nitro/h3"`.
- `import { readBody } from "h3"` → wrong. Even though Nitro is built on h3, you import through `"nitro/h3"` (the version Nitro re-exports), not `"h3"` directly.
- `nitro()` placed before `react()` in `plugins` → wrong. Must be the LAST entry, otherwise the SPA fallback intercepts Vite internals.
- Omitting `nitro()` from `vite.config.ts` entirely → `/api/*` returns `index.html` instead of JSON.
- Importing server-only packages or referencing server-only env vars (`process.env.DATABASE_URL`, secrets) from `src/` → wrong. The Vite client bundle is public; this leaks them. Server code lives in `server/` only.

<!-- nitro:end -->
