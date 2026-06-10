# KeyInvest E2E Tests

End-to-end tests for the KeyInvest portal on the **test environment**.

| | URL |
|---|-----|
| Portal | https://polite-plant-02b096d00.6.azurestaticapps.net |
| API | https://test-kiep-api.azurewebsites.net |

## Setup

```bash
cd e2e_Testing
cp .env.example .env
# Fill B2C test user credentials in .env
npm install
npm run install:browsers
npm run matrix:generate   # creates projects/keyinvest/data/matrix.xlsx
```

## Excel matrix (primary — login tests)

Edit `projects/keyinvest/data/matrix.xlsx` sheet **TestMatrix**:

| Column | Required | Notes |
|--------|----------|-------|
| caseNo | Yes | Unique id, e.g. `TC-01` (any label works — only used in reports) |
| Enabled | No | `Y` / `N` |
| Workflow | Yes | Named shortcuts: `login`, `dashboard`, `dashboard-full`, `funeral-full`, `dashboard-links` (funeral), `dashboard-exports`, `portfolio-check`, `recent-app`, `summary-filters`. Full chains like `Login > Dashboard > …` still work. |
| Persona | Yes | `guest`, `investor`, `funeral`, `adviser`, `admin` |
| username | No | Empty → `.env` for that Persona |
| password | No | Empty → `.env` for that Persona |
| expectedResult | No | `success` (default) or `validation_error` |

```bash
npm run validate:matrix          # preflight — catch typos before opening a browser
npm run matrix:plan              # list enabled tests from Excel
npm run test:matrix              # recommended — 1 login per persona, all rows in one go
npm run test:matrix:raw          # 1 login per Excel row (strict per-row login)
npm run test:matrix:funeral      # funeral rows only — saved session, no B2C
npm run test:matrix:headed       # watch in browser
npm run matrix:generate          # regenerate matrix.xlsx from scripts/generate-login-matrix.ts
```

## Code-based tests (alternative)

```bash
npm run test:login               # all personas (hardcoded spec)
npm run test:login:funeral       # single persona
npm run test:smoke               # login page loads (no credentials)
npm run test:guest
```

## Personas and credentials

| Persona | Login | .env when Excel username/password empty |
|---------|-------|----------------------------------------|
| guest | Apply Now (API) | none |
| investor | B2C investor | `INVESTOR_EMAIL`, `INVESTOR_PASSWORD` |
| funeral | B2C adviser | `FUNERAL_DIRECTOR_EMAIL`, `FUNERAL_DIRECTOR_PASSWORD` |
| adviser | B2C adviser | `FINANCIAL_ADVISER_EMAIL`, `FINANCIAL_ADVISER_PASSWORD` |
| admin | B2C adviser | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |

Excel username/password **override** `.env` when both cells are filled.

## Record a flow

```bash
npm run codegen -- https://polite-plant-02b096d00.6.azurestaticapps.net/login
```

## View report

```bash
npm run report
```
