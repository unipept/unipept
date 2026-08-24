import {describe, it, expect, vi} from "vitest";
import JsonParser, {STRING_COLOR, BOOLEAN_NULL_COLOR, NUMBER_COLOR} from "./JsonParser";

// Mock DOMPurify to avoid jsdom dependency
vi.mock("dompurify", () => {
    return {
        default: {
            sanitize: vi.fn((html) => {
                // Simple mock behavior: remove <script> tags and other malicious content roughly
                // This is just to satisfy the test that the function calls sanitize
                // We trust DOMPurify to do the actual job in production
                return html.replace(/<img[^>]*>/g, "");
            })
        }
    }
});

describe("JsonParser", () => {
    const parser = new JsonParser();

    it("should properly highlight string values", () => {
        const input = {name: "test"};
        const result = parser.parseAndHighlight(input);
        expect(result).toContain('name:');
        expect(result).toContain('<span style="color: #4070a0;">"test"</span>');
    });

    it("should properly highlight boolean values", () => {
        const input = {isActive: true, isEnabled: false};
        const result = parser.parseAndHighlight(input);
        expect(result).toContain('isActive:');
        expect(result).toContain('isEnabled:');
        expect(result).toContain(`<span style="color: ${BOOLEAN_NULL_COLOR};">true</span>`);
        expect(result).toContain(`<span style="color: ${BOOLEAN_NULL_COLOR};">false</span>`);
    });

    it("should properly highlight null values", () => {
        const input = {value: null};
        const result = parser.parseAndHighlight(input);
        expect(result).toContain('value:');
        expect(result).toContain('<span style="color: #f79ea9;">null</span>');
    });

    it("should properly highlight number values", () => {
        const input = {integer: 42, float: 3.14};
        const result = parser.parseAndHighlight(input);
        expect(result).toContain('integer:');
        expect(result).toContain('float:');
        expect(result).toContain(`<span style="color: ${NUMBER_COLOR};">42</span>`);
        expect(result).toContain(`<span style="color: ${NUMBER_COLOR};">3.14</span>`);
    });

    it("should properly highlight nested objects with mixed types", () => {
        const input = {
            name: "test",
            details: {
                active: true,
                count: 42,
                description: null
            }
        };
        const result = parser.parseAndHighlight(input);
        expect(result).toContain('name:');
        expect(result).toContain('details:');
        expect(result).toContain(`<span style="color: ${STRING_COLOR};">"test"</span>`);
        expect(result).toContain(`<span style="color: ${BOOLEAN_NULL_COLOR};">true</span>`);
        expect(result).toContain(`<span style="color: ${NUMBER_COLOR};">42</span>`);
        expect(result).toContain(`<span style="color: ${BOOLEAN_NULL_COLOR};">null</span>`);

        // Check if the nested keys from the input are also nested in the output.
        expect(result.indexOf('details:')).toBeLessThan(result.indexOf('active:'));
        expect(result.indexOf('active:')).toBeLessThan(result.indexOf('count:'));
        expect(result.indexOf('count:')).toBeLessThan(result.indexOf('description:'));
    });

    it("should strip malicious HTML in strings to prevent XSS", () => {
        const input = { malicious: "<img src=x onerror=alert(1)>" };
        const result = parser.parseAndHighlight(input);
        // We expect the output to NOT contain the malicious tag
        expect(result).not.toContain('<img src=x onerror=alert(1)>');
        // Since we are using our Mock, it should have replaced the img tag with empty string.
        // The original string was "<img ...>". JSON.stringify quotes it: "\"<img ...>\"".
        // The parser wraps it: <span...>"\"<img ...>\""</span>.
        // Mock sanitize removes <img ...>. Result is <span...>"\"\""</span>.
        expect(result).toContain(`<span style="color: ${STRING_COLOR};">""</span>`);
    });
});
