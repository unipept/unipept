import { ReleaseParser, ReleaseParserResult } from "./ReleaseParser";
import { marked } from "marked";

export default class DescriptionChangelogParser implements ReleaseParser {
    public async parse(body: string): Promise<ReleaseParserResult> {
        return {
            description: await marked(body),
            changelog: []
        }
    }
}
