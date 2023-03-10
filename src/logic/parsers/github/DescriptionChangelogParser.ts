import { ChangelogItem, ReleaseParser, ReleaseParserResult } from "./ReleaseParser";

export default class DescriptionChangelogParser implements ReleaseParser {
    public parse(body: string): ReleaseParserResult {
        const [description, ...rest] = body.replace(/- /g, "* ").split("* ");

        return {
            description: description,
            changelog: rest
                .filter(item => item.length)
                .map(this.splitTag)
        };
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
