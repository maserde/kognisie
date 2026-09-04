# Kognisie Engineering Conventions

## Product implementation

- Treat interactive widgets as learning mechanics, not decorative visualizations.
- Give every lesson activity one explicit learning objective and observable completion signal.
- Keep widget mechanics configurable and separate from lesson-specific content.
- Require deterministic reset behavior, contextual feedback, keyboard access, and responsive behavior for every interactive widget.
- Validate reuse with at least two concrete lesson use cases before extracting a generic widget abstraction.

## Vue architecture

- Use Vue 3 Composition API with `<script setup lang="ts">` for every application component.
- Organize application code by feature under `src/features/<feature>` with local `components`, `pages`, `stores`, `repositories`, `routes`, `utils`, `types`, and public API `index.ts` as needed.
- Keep cross-feature building blocks in `src/components`; reserve `components/ui` for shadcn-vue primitives.
- Features may depend on shared code and explicit contracts from other features, but shared code must not depend on feature implementations.
- Name components in PascalCase with an explicit role suffix, such as `CatalogLayout`, `LessonPage`, and `CourseCard`.
- Keep feature route records beside the feature and compose route modules explicitly in `src/router/index.ts`.
- Access catalog data through the `CatalogRepository` contract; never import catalog metadata directly into pages or components.
- Treat published lesson Markdown as the catalog availability source of truth; derive visible hierarchy, lesson counts, and durations from its frontmatter.
- Keep catalog content separate from user state; progress and preferences must use the `UserStateRepository` contract.
- Derive Continue Learning navigation by joining catalog entities with repository-backed user-state IDs; never duplicate course content inside persisted state.
- Limit Continue Learning sidebar shortcuts to the 3 most recently accessed courses; route the complete collection through My Learning.
- Persist durable browser state only in IndexedDB through the selected repository adapter, never localStorage, sessionStorage, cookies, or direct IndexedDB calls.
- Do not seed or migrate user state unless an explicit migration plan is approved.
- Persist widget interaction state by stable `lessonId + widgetId`; never persist catalog or lesson content in user state.
- Keep pending sync mutations compacted by entity so IndexedDB can become an offline queue when the API adapter arrives.
- Render nested pages through `RoutePageTransition`; keep persistent layout navigation outside it.
- Route transition keys ignore query parameters by default; explicitly allowlist only query changes that represent navigation, never transient search filters.
- Every animation must provide a `prefers-reduced-motion` fallback.

## Lesson content

- Author lessons as Comark Markdown under `src/content/<domain>/<course>/<module>/<lesson>.md`.
- Keep one generic lesson route and resolve content through `LessonContentRepository`; never add one route per lesson.
- Register reusable lesson widgets in the typed allowlist at `src/features/lesson/widgets/widget-registry.ts`.
- Every widget must define and consume an exported TypeScript props interface; build-time schema validation remains intentionally deferred.
- Preserve the 65ch editorial reading lane; widgets may break out through the shared `lesson-widget` class.
- Keep lesson navigation responsive: persistent curriculum rail on desktop, Sheet navigation on mobile, and sticky Previous/Next actions.
- Enforce sequential lesson access in routing logic; completed and current in-progress lessons are navigable, while future lessons remain locked.

## Reusable logic

- Search the VueUse API before creating a reusable utility or composable.
- Prefer `@vueuse/core` when it already provides the required behavior.
- Create a custom composable only for application-specific behavior or when VueUse cannot satisfy the requirement cleanly.
- Name custom composables `use<Domain><Behavior>` and keep them in `src/composables`.
- Document the VueUse alternatives considered when introducing overlapping reusable logic.
