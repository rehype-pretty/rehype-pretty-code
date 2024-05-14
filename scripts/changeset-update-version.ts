#!/usr/bin/env bun
import bun from 'bun';

/**
 * This script is used by the `release.yml` workflow to update the version of the packages being released.
 * The standard step is only to run `changeset version` but this does not update the lock file.
 * So we also run `pnpm install`, which does this update.
 * This is a workaround until this is handled automatically by `changeset version`.
 * See https://github.com/changesets/changesets/issues/421.
 */

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function run() {
  const versionCommand = bun.$`pnpm exec changeset version`.text();
  const installCommand = bun.$`pnpm install --lockfile-only`.text();
  // const formatCommand = bun.$`biome format . --write`.text();

  const results = await Promise.all([
    versionCommand,
    installCommand,
    // formatCommand,
  ]);

  console.info(JSON.stringify(results, undefined, 2));
}
