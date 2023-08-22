export default class JsonParser {
    public parseAndHighlight(object: object): string {
        return JSON
            .stringify(object, null, 2)
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, 
                match => {
                    if(/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            // Field
                            return match.replace(/"/g,"");
                        } else {
                            // String
                            return '<span style="color: #4070a0;">' + match + '</span>';
                        }
                    } else if(/true|false/.test(match)) {
                        // Boolean
                        return '<span style="color: #f79ea9;">' + match + '</span>';
                    } else if(/null/.test(match)) {
                        // Null
                        return '<span style="color: #f79ea9;">' + match + '</span>';
                    }

                    // Numbers
                    return '<span style="color: #40a070;">' + match + '</span>';
                }
        );
    }
}
