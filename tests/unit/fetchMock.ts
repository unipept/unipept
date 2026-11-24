import { vi } from "vitest";

export interface MockRoute {
    method?: "GET" | "POST";
    url: string | RegExp;
    response: unknown;
    status?: number;
    statusText?: string;
}

export interface RecordedRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string | undefined;
}

/**
 * Replaces the global fetch with a stub that answers from the given routes. A request that matches no route
 * fails the test. Call vi.unstubAllGlobals() in afterEach to restore fetch.
 */
export function mockFetch(routes: MockRoute[]) {
    const requests: RecordedRequest[] = [];

    const fetchStub = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = input instanceof Request ? input.url : String(input);
        const method = init?.method ?? (input instanceof Request ? input.method : "GET");
        const body = init?.body === undefined || init.body === null ? undefined : String(init.body);
        requests.push({ method, url, headers: Object.fromEntries(new Headers(init?.headers).entries()), body });

        const route = routes.find(r =>
            (r.method ?? "GET") === method && (typeof r.url === "string" ? r.url === url : r.url.test(url))
        );
        if (!route) {
            throw new Error(`No mocked response for ${method} ${url}`);
        }

        const text = typeof route.response === "string" ? route.response : JSON.stringify(route.response);
        return new Response(text, { status: route.status ?? 200, statusText: route.statusText });
    });

    vi.stubGlobal("fetch", fetchStub);
    return { fetch: fetchStub, requests };
}
