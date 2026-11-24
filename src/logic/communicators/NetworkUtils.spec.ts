import { afterEach, describe, expect, it, vi } from "vitest";
import NetworkUtils from "./NetworkUtils";
import { mockFetch } from "../../../tests/unit/fetchMock";

describe("NetworkUtils", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("getJSON parses the response body", async () => {
        mockFetch([{ url: "https://example.org/data", response: { a: 1 } }]);

        await expect(NetworkUtils.getJSON("https://example.org/data")).resolves.toEqual({ a: 1 });
    });

    it("getJSON throws with the status and the URL when the response is not OK", async () => {
        mockFetch([{ url: "https://example.org/data", response: { error: "x" }, status: 500, statusText: "Internal Server Error" }]);

        await expect(NetworkUtils.getJSON("https://example.org/data"))
            .rejects.toThrow(/Request failed: 500 Internal Server Error \(https:\/\/example\.org\/data\)/);
    });

    it("getText returns the body as text", async () => {
        mockFetch([{ url: "https://example.org/text", response: "line 1\nline 2" }]);

        await expect(NetworkUtils.getText("https://example.org/text")).resolves.toBe("line 1\nline 2");
    });

    it("getText throws with the status and the URL when the response is not OK", async () => {
        mockFetch([{ url: "https://example.org/missing", response: "", status: 404, statusText: "Not Found" }]);

        await expect(NetworkUtils.getText("https://example.org/missing"))
            .rejects.toThrow(/Request failed: 404 Not Found \(https:\/\/example\.org\/missing\)/);
    });

    it("postJSON sends the data as a JSON POST and parses the response", async () => {
        const { requests } = mockFetch([{ method: "POST", url: "https://example.org/post", response: { ok: true } }]);

        const result = await NetworkUtils.postJSON("https://example.org/post", JSON.stringify({ x: [1, 2] }));

        expect(result).toEqual({ ok: true });
        expect(requests).toHaveLength(1);
        expect(requests[0].headers).toMatchObject({
            "accept": "application/json",
            "content-type": "application/json",
        });
        expect(JSON.parse(requests[0].body!)).toEqual({ x: [1, 2] });
    });

    it("postJSON throws with the status and the URL when the response is not OK", async () => {
        mockFetch([{ method: "POST", url: "https://example.org/post", response: { error: "x" }, status: 500, statusText: "Internal Server Error" }]);

        await expect(NetworkUtils.postJSON("https://example.org/post", "{}"))
            .rejects.toThrow(/Request failed: 500 Internal Server Error \(https:\/\/example\.org\/post\)/);
    });

    it("openInBrowser opens the URL in a new window", () => {
        const open = vi.fn();
        vi.stubGlobal("window", { open });

        NetworkUtils.openInBrowser("https://unipept.ugent.be");

        expect(open).toHaveBeenCalledWith("https://unipept.ugent.be");
    });
});
