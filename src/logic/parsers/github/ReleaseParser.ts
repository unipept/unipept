export type ChangelogItem = {
    tag: string | null,
    description: string
};

export type ReleaseParserResult = {
    description: string | null,
    changelog: ChangelogItem[]
};

export interface ReleaseParser {
    parse(body: string): Promise<ReleaseParserResult>;
}
