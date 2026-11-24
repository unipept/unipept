# Contributing to Unipept

Bug reports and ideas go to the [issue tracker](https://github.com/unipept/unipept/issues). For questions, mail [unipept@ugent.be](mailto:unipept@ugent.be).

## Set up

You need Node.js (the version in `.nvmrc`) and Yarn 1 (the version in `packageManager` in `package.json`).

```bash
git clone https://github.com/unipept/unipept.git
cd unipept
yarn install --frozen-lockfile
yarn dev
```

The app runs at `http://localhost:3000`.

## Make a change

1. Create a branch from `main`.
2. Keep each pull request to one change. Split larger work into several pull requests.
3. Run the checks before you push:

   ```bash
   yarn lint --max-warnings 0
   yarn typecheck
   yarn test
   yarn test:e2e
   ```

   The end-to-end tests use the live Unipept API. Run `yarn playwright install chromium` once before the first run.
4. Open a pull request to `main`. CI runs the same checks and builds the Docker image. All of them must pass before the pull request can be merged.

## Releases

Releases are tags on `main`. See [Releasing](README.md#releasing) in the README.
