/**
 * Environment configuration contract.
 *
 * These values are environment *specifics* (URLs). Credentials never live
 * here — they are loaded from `.env` by src/config/config.ts.
 */
export interface EnvironmentConfig {
  /** Environment name: dev | qa | stage | prod | cydeo */
  name: string;
  /** Base URL of the application under test */
  baseUrl: string;
  /** Optional API base URL for future API interactions */
  apiBaseUrl?: string;
}

// Barrel re-exports of the environment constants consumed by src/config/config.ts.
export { dev } from './dev';
export { qa } from './qa';
export { stage } from './stage';
export { prod } from './prod';
export { cydeo } from './cydeo';
