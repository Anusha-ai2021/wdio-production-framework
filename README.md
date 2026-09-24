# WebdriverIO Production Automation Framework

End-to-end UI automation against [saucedemo.com](https://www.saucedemo.com/), built with
WebdriverIO + Mocha, wired for CI/CD, Allure reporting, and automatic Jira defect creation.

## 1. Local setup

```bash
npm install
cp .env.example .env          # fill in real values
npm test                      # runs headed, against TEST_ENV=dev
```

Useful variants:
```bash
npm run test:headless         # headless Chrome
npm run test:staging          # TEST_ENV=staging
npm run report:generate && npm run report:open   # Allure HTML report
```

## 2. Project layout

```
wdio.conf.js              # runner config: env switch, reporters, retries, hooks
test/pageobjects/         # Page Object Model — one class per screen
test/specs/               # Mocha test specs (BDD describe/it)
test/helpers/jiraDefectLogger.js   # auto-raises a Jira bug on test failure
.github/workflows/ci.yml  # GitHub Actions pipeline
Dockerfile                # containerized runner (selenium/standalone-chrome base)
```

## 3. How the pieces fit together

- **Page Object Model**: every spec talks to a page class, never to raw selectors.
  This is what keeps a 500-test suite maintainable — a UI change means editing one
  page object, not fifty specs.
- **Retries**: `specFileRetries: 1` re-runs a failed spec file once before it's
  reported as a real failure — standard practice for absorbing UI flakiness
  without masking genuine bugs.
- **Reporting**: Allure (rich, historical, screenshots-on-failure) is the de facto
  industry standard for WebdriverIO/Selenium suites; JUnit XML is emitted alongside
  it because most CI dashboards (GitHub, Jenkins, Azure DevOps) natively parse JUnit.
- **Defect raising**: the `afterTest` hook in `wdio.conf.js` calls
  `jiraDefectLogger` whenever a test fails. It searches Jira first so re-running a
  still-broken suite doesn't create duplicate tickets, attaches a screenshot, and
  never throws — a broken Jira integration must never break your test run.

## 4. CI/CD pipeline (`.github/workflows/ci.yml`)

Triggers: every push/PR to `main`/`develop`, a nightly 2 AM regression, and manual
dispatch with an environment picker. Steps:

1. Checkout → install Node 20 → `npm ci` → install headless Chrome
2. Run the suite (`continue-on-error` so later steps still publish results)
3. Generate the Allure HTML report
4. Upload Allure + JUnit as build artifacts (30-day retention)
5. Post a JUnit summary as a PR/run check
6. On `main`, publish the Allure report to GitHub Pages (a shareable, always-current dashboard)
7. Fail the pipeline if any test failed (so it blocks merges/deploys correctly)

### Required GitHub secrets
`SAUCE_USERNAME`, `SAUCE_PASSWORD`, `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`

## 5. Docker

```bash
docker build -t wdio-tests .
docker run --rm wdio-tests
```

## 6. Extending this framework

- Add a new screen → new file in `test/pageobjects/`
- Add a new flow → new spec in `test/specs/`
- Swap Jira for Xray/Zephyr → only `jiraDefectLogger.js` changes
- Cross-browser/cloud grid (BrowserStack/Sauce Labs) → add capabilities array entries in `wdio.conf.js`
- Parallelization → raise `maxInstances`; specs already run independently
