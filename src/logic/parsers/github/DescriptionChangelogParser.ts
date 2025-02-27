import { ChangelogItem, ReleaseParser, ReleaseParserResult } from "./ReleaseParser";
import { marked } from "marked";

export default class DescriptionChangelogParser implements ReleaseParser {
    public async parse(body: string): Promise<ReleaseParserResult> {
        return {
            description: await marked(body),
            changelog: []
        }
    }

    private splitTag(item: string): ChangelogItem {
        // Because not all releases have tags
        if(!item.startsWith("[")) {
            return {tag: null, description: item};
        }

        const [tag, ...text] = item.split(" ");

        return {tag: tag.replace(/^\[/, "").replace(/\]$/, "").toLowerCase(), description: text.join(" ").trimEnd()};
    }
}
