export class FetchInterceptor {
  static headers = {
    'Content-Type': 'application/json',
  };

  static timeout = 15000; // 15 seconds

  static register() {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), FetchInterceptor.timeout);
      let [ resource, options ] = args;

      // Start with default headers
      let finalHeaders = { ...FetchInterceptor.headers };

      // Process options headers, allowing for header removal
      if (options?.headers) {
        for (const [ key, value ] of Object.entries(options.headers)) {
          if (value === null) {
            // Remove header if value is explicitly set to null
            delete finalHeaders[key];
          } else {
            // Otherwise set or override the header
            finalHeaders[key] = value;
          }
        }
      }

      const newOptions = {
        ...options,
        headers: finalHeaders,
        signal: controller.signal
      };

      try {
        const result = await originalFetch(resource, newOptions);
        clearTimeout(id);
        return result;
      } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${FetchInterceptor.timeout}ms`, { cause: error } );
        }
        throw error;
      }
    }
  }

  static setHeader(key, value) {
    FetchInterceptor.headers[key] = value;
  }

  static removeHeader(key) {
    delete FetchInterceptor.headers[key];
  }
}
