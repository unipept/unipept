export default function useFileParser() {
    const parseFile = async function (file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // Define what to do when reading is successful
            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve(event.target.result as string);
                } else {
                    reject(new Error("Failed to read file contents."));
                }
            };

            // Define what to do if an error occurs
            reader.onerror = () => {
                reject(new Error("Error reading file."));
            };

            // Read the file as text
            reader.readAsText(file);
        });
    }

    /**
     * Try to automatically detect the delimiter that was used to separate the columns in a file. The function checks
     * for comma's, semicolons and tabs. If none of these delimiters can be found, it returns null.
     */
    const detectDelimiter = (line: string): string | null => {
        // Possible delimiters to test
        const delimiters = [",", ";", "\t"];

        // Count the occurrences of each delimiter
        const counts = delimiters.map(delimiter => ({
            delimiter,
            count: (line.match(new RegExp(`\\${delimiter}`, "g")) || []).length,
        }));

        // Find the delimiter with the highest count
        const bestMatch = counts.reduce((max, current) =>
            current.count > max.count ? current : max
        );

        // Return the best match if any delimiter was detected, otherwise null
        return bestMatch.count > 0 ? bestMatch.delimiter : null;
    };

    return {
        parseFile,
        detectDelimiter
    }
}
