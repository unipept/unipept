// Fetches the API responses that the unit tests use and saves them in this folder.
// Run with `yarn test:record`. The requests must match the ones that UnipeptCommunicator.spec.ts checks.
import { writeFile } from "node:fs/promises";

const API = "https://api.unipept.ugent.be";

type Recording = { file: string; url: string; body?: unknown };

const recordings: Recording[] = [
    {
        file: "pept2lca.json",
        url: `${API}/api/v2/pept2lca.json?equate_il=true&extra=false&names=false&input[]=AALTER&input[]=MDGTEYIIVK`,
    },
    {
        file: "taxa2tree.json",
        url: `${API}/api/v2/taxa2tree.json`,
        body: { counts: { "1678": 2, "816": 1 }, link: false },
    },
    {
        file: "taxa2rank.json",
        url: `${API}/private_api/taxa2rank.json?`,
        body: { taxa: [[1678, 816]], rank: "genus" },
    },
    {
        file: "metadata.json",
        url: `${API}/private_api/metadata?`,
    },
];

for (const { file, url, body } of recordings) {
    const response = await fetch(url, body === undefined ? undefined : {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} for ${url}`);
    }
    const data = await response.json();
    await writeFile(new URL(file, import.meta.url), JSON.stringify(data, null, 2) + "\n");
    console.log(`saved ${file}`);
}
