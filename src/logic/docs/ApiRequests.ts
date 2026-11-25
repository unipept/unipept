import NetworkUtils from "@/logic/communicators/NetworkUtils";
import { DEFAULT_API_BASE_URL } from "@/logic/Constants";

/** The endpoints of the public Unipept API, under `/api/v2/`. */
export const apiEndpoints = [
    "pept2prot", "pept2taxa", "pept2lca", "pept2ec", "pept2go", "pept2interpro", "pept2funct", "peptinfo",
    "protinfo", "taxa2lca", "taxa2tree", "taxonomy"
] as const;

export type ApiEndpoint = typeof apiEndpoints[number];

export type ApiParamValue = string | number | boolean | (string | number)[];

/** The parameters as form fields. An array becomes one `name[]` field per value. */
export function apiFormFields(params: Record<string, ApiParamValue>): [string, string][] {
    return Object.entries(params).flatMap(([name, value]): [string, string][] =>
        Array.isArray(value) ? value.map(v => [`${name}[]`, String(v)]) : [[name, String(value)]]
    );
}

/** The GET URL of a request, as the docs show it: only the values are percent-encoded, so `input[]` stays readable. */
export function apiGetUrl(endpoint: string, params: Record<string, ApiParamValue>, base = DEFAULT_API_BASE_URL): string {
    const query = apiFormFields(params).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("&");
    return `${base}/api/v2/${endpoint}.json?${query}`;
}

/** Text between single quotes in a shell command. */
const quote = (text: string) => `'${text.replace(/'/g, `'\\''`)}'`;

/**
 * The curl command of a POST request with form fields, or with `json` as the body. The data goes on a second line,
 * after a `\\`, so the command fits the page and still runs when copied.
 */
export function apiCurl(
    endpoint: string,
    params: Record<string, ApiParamValue>,
    json?: unknown,
    base = DEFAULT_API_BASE_URL
): string {
    const url = `${base.replace(/^https:\/\//, "")}/api/v2/${endpoint}`;
    if (json !== undefined) {
        return `curl -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' ${url} \\\n  --data ${quote(JSON.stringify(json))}`;
    }
    const fields = apiFormFields(postParams(endpoint, params)).map(([name, value]) => `-d ${quote(`${name}=${value}`)}`).join(" ");
    return `curl -X POST -H 'Accept: application/json' ${url}` + (fields ? ` \\\n  ${fields}` : "");
}

/**
 * The form fields of a POST request. taxa2tree takes `input[]` only in a GET request; in a POST request it takes
 * `counts[<taxon id>]`, so each taxon gets a count of 1.
 */
function postParams(endpoint: string, params: Record<string, ApiParamValue>): Record<string, ApiParamValue> {
    if (endpoint !== "taxa2tree" || !Array.isArray(params.input)) {
        return params;
    }
    const { input, ...rest } = params;
    return { ...Object.fromEntries(input.map(id => [`counts[${id}]`, 1])), ...rest };
}

/**
 * Sends the request of {@link apiCurl} to the API at `base`: a POST request with the parameters as form fields, or
 * with `json` as the body.
 */
export async function apiResponse(
    base: string,
    endpoint: string,
    params: Record<string, ApiParamValue>,
    json?: unknown
): Promise<unknown> {
    if (json !== undefined) {
        return NetworkUtils.postJSON(`${base}/api/v2/${endpoint}.json`, JSON.stringify(json));
    }
    return NetworkUtils.postForm(`${base}/api/v2/${endpoint}.json`, new URLSearchParams(apiFormFields(postParams(endpoint, params))));
}
