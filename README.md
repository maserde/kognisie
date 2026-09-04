# Kognisie

Kognisie is an interactive e-learning platform that helps students understand difficult IT
concepts through guided experimentation and reusable learning widgets. The initial curriculum
focuses on frontend and backend, while the learning model is designed to support future
technical domains.

See [`docs/PROJECT.md`](docs/PROJECT.md) for the product definition, learning principles, initial
scope, and open decisions.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Architecture

Application code uses a feature-first Vue structure:

```text
src/
├── features/<feature>/{components,pages,stores,repositories,routes,utils,types,index.ts}
├── components/{ui,navigation}
├── layouts
├── router
├── content
└── lib
```

Feature-specific code stays inside its feature. Only reusable, cross-feature building blocks belong
in `components`; `components/ui` is reserved for shadcn-vue primitives. Before adding reusable
utilities or composables, check
[`@vueuse/core`](https://vueuse.org/functions.html) and reuse its implementation when suitable. See
`AGENTS.md` for the enforced engineering conventions.

### Catalog feature

The catalog is isolated under `src/features/catalog`. UI code depends on the `CatalogRepository`
contract, while `repositories/index.ts` selects `MarkdownCatalogRepository`. Published Markdown
under `src/content` determines which domains, courses, modules, and lessons appear; lesson counts
and durations are derived from frontmatter. Display metadata remains centralized in
`catalog.metadata.ts`. Backend integration should add an API-backed implementation and change only
the repository composition root.

Feature routes live beside the feature in `features/catalog/routes/catalog.routes.ts`. Add catalog
pages under `features/catalog/pages` and register them in that route module. New feature route
modules are imported and composed once in `router/index.ts`.

### User state

Durable user state is isolated under `src/features/user-state` and stored in IndexedDB through
VueUse `useIDBKeyval`. The initial schema starts empty and intentionally performs no migration or
seeding. Catalog content never owns learner progress.

UI and Pinia stores depend on the `UserStateRepository` contract. Backend integration should add an
API-backed implementation at the repository composition root while preserving stable course,
lesson, and widget IDs. Schema v2 starts empty without migration and stores granular course
progress, widget state, preferences, sync metadata, and a compacted pending-mutation outbox.
Catalog and lesson content remain build-managed files and are never copied into IndexedDB.

### Lesson content

Lessons use Comark Markdown in `src/content` and render through one generic lesson route. Frontmatter
provides stable catalog IDs; reusable Vue widgets are inserted with MDC-compatible component syntax
and resolved from a typed, allowlisted widget registry. `LessonContentRepository` isolates the local
file source so a backend can later return the same Markdown document contract.
