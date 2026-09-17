import { EnvironmentConfig } from './index';

/** QA environment. Replace the URL with your real QA application. */
export const qa: EnvironmentConfig = {
  name: 'qa',
  baseUrl: 'https://qa.example.com',
  apiBaseUrl: 'https://qa.example.com/api',
};
