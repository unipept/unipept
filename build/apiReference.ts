import path from "node:path";
import type { MarkdownIt } from "markdown-it";
import {
    lineageRanks,
    type ApiExample,
    type ApiField,
    type ApiParameter,
    type ApiReferenceData
} from "../src/logic/docs/ApiReference.ts";

type Data = Record<string, unknown>;

const isObject = (value: unknown): value is Data => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Checks the front matter of a page with `layout: api` and turns it into the data of its API reference, with the
 * Markdown texts rendered to HTML. Throws on a mistake, with the file and the place of the mistake. The endpoint is
 * the file name of the page, such as `pept2lca` for `pept2lca.md`.
 *
 * A response field with `ranks: id` or `ranks: name` stands for the 28 lineage fields `<rank>_id` or `<rank>_name`.
 * A parameter with `values: ranks` takes the 28 ranks; `values` can also list the values themselves.
 *
 * `env` is the render env of the page, after its body is rendered, so that the code groups in the texts get names
 * that the page does not use yet.
 */
export function apiReference(
    frontmatter: Data,
    md: MarkdownIt,
    file: string,
    env: { relativePath?: string; codeGroups?: number } = {}
): ApiReferenceData {
    const fail = (where: string, message: string): never => {
        throw new Error(`${file}: ${where}: ${message}`);
    };
    const textEnv = { relativePath: env.relativePath, codeGroups: env.codeGroups };
    const inline = (text: string) => md.renderInline(text, textEnv);
    const block = (text: string) => md.render(text, textEnv);

    /** The value at `where` as an object with only these keys, and the required ones present. */
    const record = (value: unknown, where: string, required: string[], optional: string[]): Data => {
        if (!isObject(value)) {
            return fail(where, "must be an object.");
        }
        for (const key of required) {
            if (!(key in value)) {
                fail(where, `"${key}" is missing.`);
            }
        }
        for (const key of Object.keys(value)) {
            if (!required.includes(key) && !optional.includes(key)) {
                fail(where, `unknown key "${key}".`);
            }
        }
        return value;
    };
    const list = (value: unknown, where: string): unknown[] => Array.isArray(value) ? value : fail(where, "must be a list.");
    /** `ranks` for the lineage ranks, or a list of the values. */
    const parameterValues = (value: unknown, where: string): string[] => value === "ranks"
        ? [...lineageRanks]
        : list(value, where).map((v, j) => text(v, `${where}[${j}]`));
    const text = (value: unknown, where: string): string => typeof value === "string" ? value : fail(where, "must be text.");
    const optionalText = (value: unknown, where: string) => value === undefined ? undefined : text(value, where);

    const parameters = list(frontmatter.parameters ?? [], "parameters").map((value, i): ApiParameter => {
        const where = `parameters[${i}]`;
        const p = record(value, where, ["name", "type", "summary"], ["required", "default", "details", "values"]);
        if (p.required !== undefined && typeof p.required !== "boolean") {
            fail(`${where}.required`, "must be true or false.");
        }
        if (p.default !== undefined && p.type === "boolean" && typeof p.default !== "boolean") {
            fail(`${where}.default`, "must be true or false for a boolean parameter.");
        }
        if (p.default !== undefined && !["string", "number", "boolean"].includes(typeof p.default)) {
            fail(`${where}.default`, "must be text, a number, or true or false.");
        }
        const details = optionalText(p.details, `${where}.details`);
        const values = p.values === undefined ? undefined : parameterValues(p.values, `${where}.values`);
        return {
            name: text(p.name, `${where}.name`),
            type: text(p.type, `${where}.type`),
            ...(p.required ? { required: true } : {}),
            ...(p.default !== undefined ? { default: p.default as ApiParameter["default"] } : {}),
            summary: inline(text(p.summary, `${where}.summary`)),
            ...(details ? { details: block(details) } : {}),
            ...(values ? { values } : {})
        };
    });

    const field = (value: unknown, where: string): ApiField => {
        const f = record(value, where, ["name", "type", "summary"], ["when", "details", "fields", "ranks"]);
        if (f.ranks !== undefined && f.ranks !== "id" && f.ranks !== "name") {
            fail(`${where}.ranks`, `must be "id" or "name".`);
        }
        const when = optionalText(f.when, `${where}.when`);
        const details = optionalText(f.details, `${where}.details`);
        return {
            name: text(f.name, `${where}.name`),
            type: text(f.type, `${where}.type`),
            summary: inline(text(f.summary, `${where}.summary`)),
            ...(when ? { when } : {}),
            ...(details ? { details: block(details) } : {}),
            ...(f.fields !== undefined
                ? { fields: list(f.fields, `${where}.fields`).map((child, j) => field(child, `${where}.fields[${j}]`)) }
                : {}),
            ...(f.ranks ? { names: lineageRanks.map(rank => `${rank}_${f.ranks}`) } : {})
        };
    };

    const response = record(frontmatter.response, "response", ["fields"], ["summary"]);
    const responseSummary = optionalText(response.summary, "response.summary");

    const parameterNames = parameters.map(p => p.name.replace(/\[\]$/, ""));
    const ids = new Set<string>();
    const examples = list(frontmatter.examples ?? [], "examples").map((value, i): ApiExample => {
        const where = `examples[${i}]`;
        const e = record(value, where, ["title"], ["id", "description", "params", "json"]);
        if ((e.params === undefined) === (e.json === undefined)) {
            fail(where, `needs either "params" or "json".`);
        }
        if (e.params !== undefined) {
            if (!isObject(e.params)) {
                fail(`${where}.params`, "must be an object.");
            }
            for (const name of Object.keys(e.params as Data)) {
                if (!parameterNames.includes(name)) {
                    fail(`${where}.params`, `"${name}" is not one of the parameters.`);
                }
            }
        }
        const id = optionalText(e.id, `${where}.id`);
        if (id && ids.has(id)) {
            fail(`${where}.id`, `"${id}" is used twice.`);
        }
        if (id) {
            ids.add(id);
        }
        const description = optionalText(e.description, `${where}.description`);
        return {
            ...(id ? { id } : {}),
            title: text(e.title, `${where}.title`),
            ...(description ? { description: block(description) } : {}),
            ...(e.params !== undefined ? { params: e.params as ApiExample["params"] } : {}),
            ...(e.json !== undefined ? { json: e.json } : {})
        };
    });

    return {
        endpoint: path.basename(file, ".md"),
        parameters,
        response: {
            ...(responseSummary ? { summary: block(responseSummary) } : {}),
            fields: list(response.fields, "response.fields").map((value, i) => field(value, `response.fields[${i}]`))
        },
        examples
    };
}
