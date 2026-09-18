# Test Automation Plan

**Agent:** Planner Agent
**Date:** 2026-09-18
**Workflow:** test-automation
**Status:** READY (pending approval)

---

## 1. Requirements Understood

On the page **`https://zincbank.cydeo.io/`**, the following tabs must be visible:

- **PERSONAL**
- **BUSINESS**
- **CARDS**
- **COMPANY**

Automate this verification as Cucumber BDD `.feature` files executed with
Playwright via cucumber-js, following the framework architecture (Page Object
Model, env-driven config, no hardcoded credentials).

## 2. Application Discovery — zincbank.cydeo.io

- **ZincBank** — a CYDEO simulated banking application for QA education
  (server-rendered HTML, ~55 KB, tab presence requires no JavaScript).
- The four tabs are **anchor links inside `<nav aria-label="Primary">`** within the
  sticky `<header>`:

| Tab (visible text) | Exact markup | href |
| --- | --- | --- |
| PERSONAL | `<a class="smallcaps …">Personal</a>` | `#features` |
| BUSINESS | `<a class="smallcaps …">Business</a>` | `#features` |
| CARDS | `<a class="smallcaps …">Cards</a>` | `#feature-card` |
| COMPANY | `<a class="smallcaps …">Company</a>` | `#footer` |

- Uppercase rendering is applied via CSS (`smallcaps`); HTML text is
  Title-case. Playwright name matching is **case-insensitive** by default, so the
  requirement text (PERSONAL, etc.) matches.
- The tab container is `hidden … md:flex` → tabs are **hidden below the `md`
  breakpoint (~768 px)**, so tests must run at a desktop viewport.
- Tabs have **no `data-testid`** (unlike `home-nav-login` / `home-nav-apply`),
  so locators must target accessible names scoped to the Primary navigation.
- Other nav links: "Log in" (`data-testid="home-nav-login"`, `/login`),
  "Open account" (`data-testid="home-nav-apply"`, `/apply`), theme toggle.

## 3. Test Scenarios

### Feature: Home page navigation — `features/home/home-tabs.feature`

| # | Scenario | Tags |
| --- | --- | --- |
| 1 | The home page shows the PERSONAL, BUSINESS, CARDS, and COMPANY tabs in the primary navigation (all four visible) | `@smoke @critical` |
| 2 | Scenario Outline: "The `<tab>` tab is visible on the home page" — Examples: PERSONAL, BUSINESS, CARDS, COMPANY | `@smoke` |
| 3 | The four tabs are rendered as links within the Primary navigation (`role=link`, `aria-label="Primary"` nav) | `@sanity` |

Verification: each tab locator asserts `toBeVisible()` (Playwright auto-waits);
Scenario 3 additionally asserts `toBeAttached()`/`toBeVisible()` scoped to the
`navigation` role named `Primary`.

## 4. Preconditions

- Target environment reachable: `https://zincbank.cydeo.io/`.
- Environment profile **`cydeo`** added to the config layer (base URL
  `https://zincbank.cydeo.io`), or `BASE_URL` override in `.env`.
- Local `.env` with placeholder `USERNAME`/`PASSWORD` — required because the
  config layer rejects non-localhost targets without credentials. The file is
  gitignored and the values are never used by these scenarios.
- **Desktop viewport** (framework default `1440x900`) — tabs are hidden below
  ~768 px.
- No authentication required for the home page.

## 5. Test Data Requirements

- Only the four expected tab labels: **PERSONAL, BUSINESS, CARDS, COMPANY**.
- No seeded data or credentials used by this feature.

## 6. Pages / Components Involved

New **`HomePage`** page object (`src/pages/HomePage.ts`):

| Element | Purpose |
| --- | --- |
| `primaryNavigation` | `page.getByRole('navigation', { name: 'Primary' })` |
| `navTab(name)` | scoped link locator by accessible name inside the nav |
| `expectedTabs` | `['Personal', 'Business', 'Cards', 'Company']` |

## 7. Suggested Locators

Accessible-by-role/label/testid only — **no CSS/XPath**.

- `page.getByRole('navigation', { name: 'Primary' })`
- `page.getByRole('link', { name: 'Personal', exact: true })`
- `page.getByRole('link', { name: 'Business', exact: true })`
- `page.getByRole('link', { name: 'Cards', exact: true })`
- `page.getByRole('link', { name: 'Company', exact: true })`
- Scoped: `primaryNavigation.getByRole('link', { name: '<tab>', exact: true })`

## 8. Automation Strategy

- Cucumber-js v13 + TypeScript + Playwright; Page Object Model with thin steps.
- New **`cydeo`** environment profile (`src/config/environments/cydeo.ts`)
  registered in `src/config/environments/index.ts`; existing
  `dev`/`qa`/`stage`/`prod` untouched.
- Runner (`scripts/run-tests.js`) must **not** start the local demo server for
  non-localhost targets.
- Tags: `@smoke`, `@sanity`, `@critical` (map to existing npm scripts).
- Reports: JSON + Allure (already configured in `cucumber.js`).

## 9. Expected Implementation Scope (Test Generator Agent)

1. `src/config/environments/cydeo.ts` + register in
   `src/config/environments/index.ts` (`baseUrl: 'https://zincbank.cydeo.io'`).
2. `.env` (local, gitignored) with placeholder `USERNAME`/`PASSWORD`.
3. `src/support/world.ts` — custom `World` (page + page objects) — required
   Cucumber glue, currently missing.
4. `src/hooks/**` — `Before` / `After` / `AfterAll` browser lifecycle hooks
   (currently missing).
5. `src/pages/HomePage.ts` — home page POM for the primary navigation.
6. `src/steps/home.ts` — step definitions for tab visibility.
7. `features/home/home-tabs.feature` — feature file with the scenarios above.
8. `scripts/run-tests.js` — runner that forwards CLI flags, spawns cucumber-js,
   and starts the local demo server **only** for localhost `dev` targets.
9. Run the generated tests against `https://zincbank.cydeo.io/` and report.

## 10. Final Plan Status

**READY** — pending user approval before invoking the Test Generator Agent.
