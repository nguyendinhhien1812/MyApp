// Logger tối giản cho app. Chỉ in khi chạy dev — bản release không để lại rác log,
// nên không cần babel transform-remove-console.
// Prefix theo module để dễ lọc khi debug: logger.warn('theme', '...')

type Level = 'warn' | 'error';

function write(level: Level, scope: string, message: string, detail?: unknown) {
  if (!__DEV__) {
    return;
  }
  const line = `[${scope}] ${message}`;
  if (level === 'error') {
    console.error(line, detail ?? '');
  } else {
    console.warn(line, detail ?? '');
  }
}

export const logger = {
  warn: (scope: string, message: string, detail?: unknown) =>
    write('warn', scope, message, detail),
  error: (scope: string, message: string, detail?: unknown) =>
    write('error', scope, message, detail),
};
