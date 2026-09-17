/**
 * Lightweight, dependency-free logger.
 *
 * Rules:
 *  - Never log passwords, tokens, cookies, or any sensitive value.
 *  - Prefix sensitive arguments with a warning instead of logging them.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return ORDER[level] >= ORDER[LEVEL];
}

function timestamp(): string {
  return new Date().toISOString();
}

function format(level: LogLevel, message: string): string {
  return `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug(message: string): void {
    if (shouldLog('debug')) console.debug(format('debug', message));
  },
  info(message: string): void {
    if (shouldLog('info')) console.log(format('info', message));
  },
  warn(message: string): void {
    if (shouldLog('warn')) console.warn(format('warn', message));
  },
  error(message: string): void {
    if (shouldLog('error')) console.error(format('error', message));
  },
};
