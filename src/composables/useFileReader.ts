export default function useFileReader() {
    const readFile = async function (file: File): Promise<string> {
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

    return {
        readFile
    }
}