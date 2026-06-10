# Commands reference

## Excel matrix (recommended)

```bash
npm run matrix:generate          # create matrix.xlsx (L-* login, D-* dashboard rows)
npm run matrix:plan              # list enabled tests from Excel
npm run test:matrix:grouped      # 1 login per persona — all rows for that role in one test
npm run test:matrix              # 1 login per Excel row (15 tests if all enabled)
npm run test:matrix:funeral      # funeral dashboard rows — saved session, fastest
```

Excel file: `projects/keyinvest/data/matrix.xlsx`

| Column | Example |
|--------|---------|
| caseNo | L-01 |
| Enabled | Y |
| Workflow | `Login`, `Login > Dashboard`, `Verify Dashboard Links` (funeral), `Verify Dashboard Exports` (funeral/adviser/admin) |
| Persona | funeral |
| username | (empty = .env) |
| password | (empty = .env) |
| expectedResult | success |

## Code-based login tests

```bash
npm run test:login              # all 5 personas + invalid login
npm run test:login:headed       # visible browser
```

| User | Headless | Watch |
|------|----------|-------|
| Guest | `npm run test:login:guest` | `npm run test:login:guest:headed` |
| Investor | `npm run test:login:investor` | `npm run test:login:investor:headed` |
| Funeral Director | `npm run test:login:funeral` | `npm run test:login:funeral:headed` |
| Financial Adviser | `npm run test:login:adviser` | `npm run test:login:adviser:headed` |
| Admin | `npm run test:login:admin` | `npm run test:login:admin:headed` |

```bash
npm run test:login:invalid      # wrong B2C password (code spec)
```

## Credentials

| Persona | .env variables |
|---------|----------------|
| guest | none |
| investor | `INVESTOR_EMAIL`, `INVESTOR_PASSWORD` |
| funeral | `FUNERAL_DIRECTOR_EMAIL`, `FUNERAL_DIRECTOR_PASSWORD` |
| adviser | `FINANCIAL_ADVISER_EMAIL`, `FINANCIAL_ADVISER_PASSWORD` |
| admin | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |

## Other

```bash
npm run test:smoke
npm run report
npm run test:ui
```
