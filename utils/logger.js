import log from 'loglevel';

// Set level based on environment
const level = import.meta && import.meta.env && import.meta.env.DEV
  ? 'debug'
  : 'warn';
log.setLevel(level);

// Base logger without prefix (if you need it directly)
export const logger = {
  debug: (...args) => log.debug(...args),
  info:  (...args) => log.info(...args),
  warn:  (...args) => log.warn(...args),
  error: (...args) => log.error(...args),
};

// Factory for prefixed loggers
export function createLogger(prefix = '') {
  const tag = prefix ? `[${prefix}]` : '';

  return {
    debug: (...args) => log.debug(tag, ...args),
    info:  (...args) => log.info(tag, ...args),
    warn:  (...args) => log.warn(tag, ...args),
    error: (...args) => log.error(tag, ...args),
  };
}
