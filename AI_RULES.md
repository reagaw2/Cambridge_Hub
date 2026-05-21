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
