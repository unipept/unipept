import {describe, it, expect} from "vitest";
import JsonParser, {STRING_COLOR, BOOLEAN_NULL_COLOR, NUMBER_COLOR} from "./JsonParser";

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
});