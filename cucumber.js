/**
 * Cucumber configuration (CommonJS).
 *
 * Runner entry point is scripts/run-tests.js which:
 *  - starts/stops the bundled demo app when targeting localhost (dev)
 *  - forwards CLI flags (--tags, --browser, --headed, --env, --workers)
 *  - spawns cucumber-js
 *
 * Environment-sensitive defaults:
 *  - parallel: WORKERS if set, otherwise 4 on CI, 1 locally
 *  - retry:    1 on CI, 0 locally (controlled via the CI env variable)
 */
module.exports = {
  default: {
    // Transpile TypeScript support code at runtime.
    requireModule: ['tsx'],
    require: ['src/support/world.ts', 'src/hooks/**/*.ts', 'src/steps/**/*.ts'],

    paths: ['features/**/*.feature'],

    format: [
      'progress-bar',
      'json:reports/cucumber-report/cucumber-report.json',
      'allure-cucumberjs/reporter',
    ],
    formatOptions: {
      environmentInfo: {
        environment: process.env.ENV || 'dev',
        browser: process.env.BROWSER || 'chromium',
        headless: process.env.HEADLESS !== 'false' ? 'true' : 'false',
        node_version: process.version,
        platform: `${process.platform} ${process.arch}`,
        ci: process.env.CI ? 'true' : 'false',
      },
    },

    parallel: process.env.WORKERS
      ? parseInt(process.env.WORKERS, 10)
      : process.env.CI
        ? 4
        : 1,

    retry: process.env.CI ? 1 : 0,

    // Never publish results to cucumber.io.
    publish: false,
  },
};
