export class FetchInterceptor {
    static headers = {
        "Content-Type": "application/json",
    };

    static register() {
        const {fetch: originalFetch} = window;

        window.fetch = async (...args) => {
            let [resource, options] = args;

            // Start with default headers
            let finalHeaders = {...FetchInterceptor.headers};

            // Process options headers, allowing for header removal
            if (options?.headers) {
                for (const [key, value] of Object.entries(options.headers)) {
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
                headers: finalHeaders
            };

            return await originalFetch(resource, newOptions);
        }
    }

    static setHeader(key, value) {
        FetchInterceptor.headers[key] = value;
    }

    static removeHeader(key) {
        delete FetchInterceptor.headers[key];
    }
}
