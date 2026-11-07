import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve('@playwright/test/cli'), 'install', 'chromium', '--only-shell'], {
  stdio: 'inherit', env: {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? fileURLToPath(new URL('../.browsers', import.meta.url))
  }
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
