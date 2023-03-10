import { ChangelogItem, ReleaseParser, ReleaseParserResult } from "./ReleaseParser";

export default class DesktopReleaseParser implements ReleaseParser {
    public parse(body: string): ReleaseParserResult {
        const [description, ...rest] = body.split("**");

        if(rest.length == 0) {
            return {description: description, changelog: []};
        }

        if(rest.length == 4) {
            return {
                description: description, 
                changelog: this.parseItems(rest[1] + rest[3])
            }
        }

        return {
            description: description, 
            changelog: this.parseItems(rest[1])
        }
    }

    private parseItems(body: string): ChangelogItem[] {
        return body
            .trim()
            .replace(/- /g, "* ")
            .split('* ')
            .filter(item => item.length)
            .map(this.splitTag);
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
