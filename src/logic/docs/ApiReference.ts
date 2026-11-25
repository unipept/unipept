// No imports: the build reads this file to check the front matter of API pages.

export type ApiParamValue = string | number | boolean | (string | number)[];

/** The ranks of the lineage fields that the API returns, in lineage order. */
export const lineageRanks = [
    "domain", "realm", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class",
    "subclass", "superorder", "order", "suborder", "infraorder", "superfamily", "family", "subfamily", "tribe",
    "subtribe", "genus", "subgenus", "species_group", "species_subgroup", "species", "subspecies", "strain",
    "varietas", "forma"
];

// In the front matter, summary, details and description are Markdown. After the build, they are HTML.

export interface ApiParameter {
    /** Name as sent, such as `input[]` for a list. */
    name: string;
    type: string;
    required?: boolean;
    default?: string | number | boolean;
    summary: string;
    details?: string;
    /** The values that the parameter takes, such as the ranks. */
    values?: string[];
}

export interface ApiField {
    name: string;
    type: string;
    summary: string;
    /** Condition on the parameters for the field to be present, such as "extra and names". */
    when?: string;
    details?: string;
    /** Fields of the objects in a list or object field. */
    fields?: ApiField[];
    /** The field names that a group of fields stands for, such as the 28 lineage fields. */
    names?: string[];
}

export interface ApiExample {
    /** Anchor of the example, such as `example2`. */
    id?: string;
    title: string;
    description?: string;
    /** Parameters, sent as form fields or in the query string. */
    params?: Record<string, ApiParamValue>;
    /** Body of a POST request that cannot be sent as form fields. */
    json?: unknown;
}

export interface ApiReferenceData {
    /** Name of the endpoint under `/api/v2/`, which is the file name of the page. */
    endpoint: string;
    parameters: ApiParameter[];
    response: {
        summary?: string;
        fields: ApiField[];
    };
    examples: ApiExample[];
}
