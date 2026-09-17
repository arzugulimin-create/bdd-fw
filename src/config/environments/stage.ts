import { EnvironmentConfig } from './index';

/** Stage environment. Replace the URL with your real stage application. */
export const stage: EnvironmentConfig = {
  name: 'stage',
  baseUrl: 'https://stage.example.com',
  apiBaseUrl: 'https://stage.example.com/api',
};
