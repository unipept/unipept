const STRING_COLOR = "#4070a0";
const BOOLEAN_NULL_COLOR = "#f79ea9";
const NUMBER_COLOR = "#40a070";

export {STRING_COLOR, BOOLEAN_NULL_COLOR, NUMBER_COLOR};

export default class JsonParser {


    /**
     * Converts a JavaScript object into a formatted and syntax-highlighted HTML string. This is mainly used for
     * displaying input and output examples in the online Unipept documentation for the API (and CLI).
     *
     * @param {object} object - The JavaScript object to parse and highlight.
     * @return {string} A string representing the highlighted JSON data (as HTML).
     */
    public parseAndHighlight(object: object): string {
        return JSON
            .stringify(object, null, 2)
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, 
                match => {
                    if(/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            // Field - strip quotes and escape
                            return this.escapeHtml(match.replace(/"/g,""));
                        } else {
                            // String - escape content
                            return '<span style="color: ' + STRING_COLOR + ';">' + this.escapeHtml(match) + '</span>';
                        }
                    } else if(/true|false/.test(match)) {
                        // Boolean
                        return '<span style="color: ' + BOOLEAN_NULL_COLOR + ';">' + match + '</span>';
                    } else if (/null/.test(match)) {
                        // Null
                        return '<span style="color: ' + BOOLEAN_NULL_COLOR + ';">' + match + '</span>';
                    }

                    // Numbers
                    return '<span style="color: ' + NUMBER_COLOR + ';">' + match + '</span>';
                }
        );
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
