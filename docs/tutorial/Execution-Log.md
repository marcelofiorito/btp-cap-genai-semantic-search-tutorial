# Execution Log - Tutorial Steps (SAP Presales BR - USA)

This file documents what was effectively executed for each tutorial step in this repository deployment.

## Step 1 - Requirements

Status: Completed

What was validated:

- Node.js, npm, git, Cloud Foundry CLI, MBT, and CDS CLI are available locally.
- Cloud Foundry target was switched to:
  - Org: `SAP Presales Brazil - BTP_sap-presales-br-usa`
  - Space: `DEV`
- AI Core `extended` plan is available and running in this subaccount.
- SAP HANA (`hdi-shared`) and Destination (`lite`) services required by this sample are available.

## Step 2 - Setup and Deploy

Status: Completed

What was executed:

- `npm install` in root and modules.
- Build and deploy pipeline:
  - `npm run build`
  - `npm run deploy`
- Existing MTA resources/apps were updated in place:
  - `genai-semantic-search-sample-DEV`
  - `genai-semantic-search-sample-srv-DEV`
  - `genai-semantic-search-sample-db-deployer-DEV`

Additional fixes applied to make deployment reliable:

- `router/package.json` engine updated to `^20.x` to match CF buildpack runtime.
- TypeScript shim added for CAP typing compatibility:
  - `api/srv/cds-shim.d.ts`
- Minor typing adjustments in service handler signatures:
  - `api/srv/sample.ts`

## Step 3 - Data Model

Status: Completed (as provided by sample)

What was validated:

- HANA schema artifacts were generated during `cds build` and deployed via DB deployer.
- `cds.Vector` model is active in HANA target (semantic embedding storage).

## Step 4 - UI Setup

Status: Completed

What was executed:

- UI module build completed as part of `npm run build`.
- AppRouter route is active and published.

Published URL:

- `https://sap-presales-brazil---btp-sap-presales-br-usa-dev-genai73ca7346.cfapps.us10.hana.ondemand.com/index.html`

## Step 5 - Validation and Testing

Status: Completed

What was executed and validated:

- XSUAA token retrieval succeeded.
- Backend tests succeeded:
  - `POST /odata/v4/sample/embed` returned `true`.
  - `POST /odata/v4/sample/search` returned semantic results with similarity score.
  - `GET /odata/v4/sample/Documents` returned persisted records.
- UI validation succeeded (semantic search screen operational and results visible).

Important runtime binding performed:

- `aicore` service was explicitly bound to `genai-semantic-search-sample-srv-DEV`.

## Step 6 - Extend

Status: Not executed by design

Reason:

- Per user request, no extension implementation was started yet.
- Only conceptual explanation of Step 6 scope was provided (complex data model/testing and advanced scoring/search options).

## Local Development Notes

- Local credential files remain intentionally untracked by git:
  - `router/dev/default-services.json`
  - `api/test/requests.http`
- Hybrid profile bindings were refreshed with:
  - `cds bind -2 genai-semantic-search-sample-uaa`
  - `cds bind -2 genai-semantic-search-sample-destination`
  - `cds bind -2 genai-semantic-search-sample-hdi-container`
  - `cds bind -2 aicore`
