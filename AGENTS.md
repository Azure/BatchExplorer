# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Azure Batch Explorer is a Lerna-based monorepo for managing Azure Batch accounts. It ships as both an Electron desktop app and an experimental web UI. The codebase has 10 packages under `desktop/`, `packages/*`, `util/*`, and `web/`.

### Node.js version

This project requires **Node.js 18 LTS** (`nvm use 18`). Node 22+ causes `@testing-library/dom` hoisting issues that break the build. The VM snapshot should already have Node 18 set as the default.

### Post-install setup caveat

After `npm install`, `@testing-library/dom` (a transitive dependency of `@testing-library/react`) may not be hoisted to the root `node_modules/`. If the build fails with `Cannot find module '@testing-library/dom'`, fix it by symlinking:

```sh
ln -sf /workspace/node_modules/@testing-library/react/node_modules/@testing-library/dom /workspace/node_modules/@testing-library/dom
```

### Key commands

All commands are run from the repo root (`/workspace`).

| Task | Command |
|------|---------|
| Install dependencies | `npm install --legacy-peer-deps` |
| Install bux CLI | `npm run dev-setup` |
| Build all packages | `npm run build` |
| Lint (Prettier + ESLint + Markdownlint + Stylelint) | `npm run lint` |
| Test library packages | `npm run test:lib` |
| Test web package | `npm run test:web` |
| Start web dev server (port 9000) | `npm run start:web` |
| Start desktop dev mode | `npm run launch:desktop` |

See `docs/setup.md` for full setup instructions and `docs/testing.md` for testing details.

### Desktop app

The desktop app (`desktop/`) uses Electron + Angular 12 + Karma/Jasmine for tests. Running `npm run launch:desktop` requires a display (Electron GUI). Desktop tests (`npm run test:desktop`) also require a display since Karma launches Electron. The web UI and library packages can be built and tested headlessly.

### Web app

The web UI (`web/`) runs via webpack-dev-server on **port 9000**. Start it with `npm run start:web` which also watches all library packages. The web app uses fake/mock data in standalone mode and does not require Azure credentials to render.
