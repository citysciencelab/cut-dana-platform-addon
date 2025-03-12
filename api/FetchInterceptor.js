export class FetchInterceptor {
    static headers = {
        "Content-Type": "application/json",
    };

    static register() {
        const {fetch: originalFetch} = window;

        window.fetch = async (...args) => {
            let [resource, options] = args;

            const newOptions = {
                ...options,
                headers: {
                    ...options?.headers,
                    ...FetchInterceptor.headers
                }
            };

            const response = await originalFetch(resource, newOptions);
            return response;
        }
    }

    static setHeader(key, value) {
        FetchInterceptor.headers[key] = value;
    }
}
