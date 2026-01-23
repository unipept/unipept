import { describe, it, expect } from 'vitest';
import DesktopReleaseParser from './DesktopReleaseParser';

describe('DesktopReleaseParser', () => {
    const parser = new DesktopReleaseParser();

    it('should parse simple description without changelog', async () => {
        const body = "Just a description.";
        const result = await parser.parse(body);
        expect(result.description).toBe("Just a description.");
        expect(result.changelog).toEqual([]);
    });

    it('should parse description with one changelog section', async () => {
        const body = "Description **Changelog** * [FEAT] New feature * [FIX] Bug fix";
        const result = await parser.parse(body);
        expect(result.description).toBe("Description ");
        expect(result.changelog).toHaveLength(2);
        expect(result.changelog[0]).toEqual({ tag: "feat", description: "New feature" });
        expect(result.changelog[1]).toEqual({ tag: "fix", description: "Bug fix" });
    });

    it('should parse description with two changelog sections', async () => {
        const body = "Description **Features** * [FEAT] New feature **Fixes** * [FIX] Bug fix";
        const result = await parser.parse(body);
        expect(result.description).toBe("Description ");
        expect(result.changelog).toHaveLength(2);
        // Note: The parser implementation concatenates rest[1] and rest[3].
        // rest[1] is " * [FEAT] New feature "
        // rest[3] is " * [FIX] Bug fix"
        // Combined: " * [FEAT] New feature  * [FIX] Bug fix"

        expect(result.changelog[0]).toEqual({ tag: "feat", description: "New feature" });
        expect(result.changelog[1]).toEqual({ tag: "fix", description: "Bug fix" });
    });

    it('should handle items without tags', async () => {
        const body = "Description **Changelog** * Just an item";
        const result = await parser.parse(body);
        expect(result.changelog[0]).toEqual({ tag: null, description: "Just an item" });
    });

    it('should handle hyphen bullets', async () => {
        const body = "Description **Changelog** - [FEAT] Item";
        const result = await parser.parse(body);
        expect(result.changelog[0]).toEqual({ tag: "feat", description: "Item" });
    });

    it('should ignore empty items from double delimiters', async () => {
         const body = "Description **Changelog** * Item 1 * * Item 2";
         const result = await parser.parse(body);
         expect(result.changelog).toHaveLength(2);
         expect(result.changelog[0].description).toContain("Item 1");
         expect(result.changelog[1].description).toContain("Item 2");
    });
});
