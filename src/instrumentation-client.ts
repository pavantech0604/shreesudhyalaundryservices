// Keep the original exception visible; record its full stack for local diagnosis.
// Replacing the listener makes this safe when instrumentation itself is refreshed.
if (process.env.NODE_ENV === 'development') {
  const diagnostics = window as Window & { __laundryErrorListener?: AbortController };
  diagnostics.__laundryErrorListener?.abort();
  const controller = new AbortController();
  diagnostics.__laundryErrorListener = controller;
  window.addEventListener('error', event => {
    if (event.error instanceof Error) {
      console.error('[Laundry runtime stack]', event.error.stack ?? event.error.message);
    }
  }, { signal: controller.signal });
}
