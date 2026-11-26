import { describe, expect, it } from "vitest";
import type { RouteRecordRaw } from "vue-router";
import { routes } from "./routes";

/** Full path of every route without children, and of its aliases. */
function paths(records: RouteRecordRaw[], parent = ""): string[] {
    return records.flatMap(record => {
        const own = [record.path, ...[record.alias ?? []].flat()]
            .map(path => path.startsWith("/") ? path : `${parent}/${path}`.replace(/\/$/, "") || "/");
        return record.children ? own.flatMap(path => paths(record.children!, path)) : own;
    });
}

describe("routes", () => {
    // Importing the routes builds the docs sections, which fails on a mistake in src/content/docs.
    it("include the docs sections", () => {
        expect(routes.length).toBeGreaterThan(0);
    });

    it("have no path twice", () => {
        const all = paths(routes);
        expect(all.filter((path, index) => all.indexOf(path) !== index)).toEqual([]);
    });
});
