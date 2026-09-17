import { EnvironmentConfig } from './index';

/**
 * Local development environment.
 * Points at the bundled demo application (scripts/demo-server.js).
 */
export const dev: EnvironmentConfig = {
  name: 'dev',
  baseUrl: 'http://localhost:3100',
  apiBaseUrl: 'http://localhost:3100/api',
};
